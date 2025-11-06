import { Resend } from 'resend';
import prisma from './prismaClient';

// Initialiser Resend avec la clé API depuis les variables d'environnement
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Template d'email HTML pour les notifications d'articles
function getEmailTemplate(article: {
  title: string;
  excerpt?: string | null;
  category?: string | null;
  image?: string | null;
  slug: string;
  siteUrl: string;
}) {
  const articleUrl = `${article.siteUrl}/actualite/article/${article.slug}`;
  const category = article.category || 'Actualité';
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvel article : ${article.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Les As de la Presse</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Nouvel article publié</h2>
    
    ${article.image ? `
    <div style="margin: 20px 0;">
      <img src="${article.image}" alt="${article.title}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block;" />
    </div>
    ` : ''}
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <span style="background: #2563eb; color: white; padding: 5px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${category}</span>
    </div>
    
    <h3 style="color: #111827; font-size: 20px; margin: 20px 0 10px 0;">${article.title}</h3>
    
    ${article.excerpt ? `
    <p style="color: #6b7280; font-size: 16px; margin: 15px 0;">${article.excerpt}</p>
    ` : ''}
    
    <div style="margin: 30px 0;">
      <a href="${articleUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Lire l'article</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
    
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
      <a href="${article.siteUrl}/actualite?unsubscribe=true" style="color: #2563eb; text-decoration: none;">Se désabonner</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

// Fonction pour envoyer des notifications aux abonnés
export async function sendNewsletterNotification(article: {
  title: string;
  excerpt?: string | null;
  category?: string | null;
  image?: string | null;
  slug: string;
}) {
  // Si Resend n'est pas configuré, on log juste et on continue
  if (!resend) {
    console.warn('[email] Resend API key not configured, skipping email notification');
    return { success: false, reason: 'RESEND_NOT_CONFIGURED' };
  }

  // Récupérer l'URL du site depuis les variables d'environnement
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://asdelepresse.vercel.app';

  try {
    // Récupérer tous les abonnés
    const subscribers = await prisma.newsletterSubscriber.findMany({
      select: { email: true },
    });

    if (subscribers.length === 0) {
      console.log('[email] No subscribers to notify');
      return { success: true, sent: 0, reason: 'NO_SUBSCRIBERS' };
    }

    console.log(`[email] Sending notification to ${subscribers.length} subscribers`);

    // Préparer le template d'email
    const emailHtml = getEmailTemplate({
      ...article,
      siteUrl,
    });

    // Envoyer les emails en batch (Resend limite à 50 destinataires par batch)
    const batchSize = 50;
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const recipients = batch.map(s => s.email);

      try {
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Les As de la Presse <noreply@asdelepresse.vercel.app>',
          to: recipients,
          subject: `📰 Nouvel article : ${article.title}`,
          html: emailHtml,
        });

        if (error) {
          console.error('[email] Error sending batch:', error);
          totalFailed += batch.length;
        } else {
          console.log(`[email] Batch sent successfully:`, data);
          totalSent += batch.length;
        }
      } catch (batchError: any) {
        console.error('[email] Exception sending batch:', batchError);
        totalFailed += batch.length;
      }
    }

    console.log(`[email] Notification sent: ${totalSent} successful, ${totalFailed} failed`);

    return {
      success: totalSent > 0,
      sent: totalSent,
      failed: totalFailed,
      total: subscribers.length,
    };
  } catch (error: any) {
    console.error('[email] Error sending newsletter notification:', error);
    return {
      success: false,
      reason: 'SEND_ERROR',
      error: error?.message,
    };
  }
}

