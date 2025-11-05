<#
 diagnostics script - diagnose git push / network issues to GitHub

 Usage (run from the repo root):
  powershell -ExecutionPolicy Bypass -File .\scripts\diagnose_push.ps1

 This script runs a set of commands that help diagnose:
 - detached HEAD / branch state
 - git status and remote configuration
 - DNS/connectivity to github.com
 - attempts a git push (will prompt for credentials if needed)

 It writes a log file at ./scripts/diagnostics_push.log which you can copy-paste here.

 WARNING: This script may print sensitive info (branch names, remotes). Do not share secrets.
#>

$LogPath = Join-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -ChildPath 'diagnostics_push.log'
if (Test-Path $LogPath) { Remove-Item $LogPath -Force }

Write-Output "Diagnostics started at $(Get-Date)" | Tee-Object -FilePath $LogPath

function Run { param($cmd)
  Write-Output "`n>> $cmd`n" | Tee-Object -FilePath $LogPath -Append
  try {
    $out = Invoke-Expression $cmd 2>&1
    $out | Tee-Object -FilePath $LogPath -Append
  } catch {
    $_ | Tee-Object -FilePath $LogPath -Append
  }
}

Push-Location (Join-Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) '..')

Run 'git rev-parse --abbrev-ref HEAD'
Run 'git status --porcelain --branch'
Run 'git branch -vv'
Run 'git remote -v'
Run 'git log --oneline -n 5'

# Network checks
Run 'Test-NetConnection -ComputerName github.com -Port 443'
Run 'nslookup github.com'
Run 'ping -n 4 github.com'
Run 'Test-NetConnection -ComputerName 140.82.112.3 -Port 443'

# Optional: flush DNS (uncomment to run)
# Run 'ipconfig /flushdns'

# Try pushing (this will attempt to push and may prompt for credentials)
Write-Output "`n>> Attempting: git push -u origin main`n" | Tee-Object -FilePath $LogPath -Append
try {
  git push -u origin main 2>&1 | Tee-Object -FilePath $LogPath -Append
} catch {
  $_ | Tee-Object -FilePath $LogPath -Append
}

Write-Output "`nDiagnostics finished at $(Get-Date)`n" | Tee-Object -FilePath $LogPath -Append

Write-Output "Log written to: $LogPath"

Pop-Location
