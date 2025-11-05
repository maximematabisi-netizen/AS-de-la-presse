export default function PrivacyPageProxy() {
	return (
		<main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<div className="max-w-3xl mx-auto p-8">
				<h1 className="text-2xl font-bold mb-4">Politique de confidentialité</h1>
				<p className="text-gray-700 dark:text-gray-300">Cette page explique comment nous collectons et utilisons les donn&apos;es. (Contenu de démonstration)</p>

				<section id="terms" className="mt-6">
					<h2 className="text-xl font-semibold mb-2">Conditions d'utilisation</h2>
					<p className="text-gray-700 dark:text-gray-300">En utilisant ce site, vous acceptez nos conditions d&apos;utilisation. (Texte d&apos;exemple)</p>
				</section>

				<section id="cookies" className="mt-6">
					<h2 className="text-xl font-semibold mb-2">Cookies</h2>
					<p className="text-gray-700 dark:text-gray-300">Nous utilisons des cookies pour améliorer votre exp&eacute;rience. Vous pouvez gérer vos pr&eacute;f&eacute;rences de cookies dans les param&egrave;tres de votre navigateur.</p>
				</section>
			</div>
		</main>
	);
}
