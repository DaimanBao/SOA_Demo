param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("check", "up", "down", "start", "stop", "restart", "logs", "status")]
  [string]$Action,
  [Parameter(Position = 1)]
  [ValidateSet("auth-service", "sinhvien-service", "detai-service", "dangky-service", "api-gateway")]
  [string]$Service
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

function Get-DotEnvValue {
  param(
    [string]$Path,
    [string]$Name
  )

  if (-not (Test-Path $Path)) {
    throw "Configuration file not found: $Path"
  }

  $line = Get-Content $Path | Where-Object {
    $_ -match "^\s*$([regex]::Escape($Name))\s*="
  } | Select-Object -First 1

  if (-not $line) {
    throw "Variable $Name was not found in $Path"
  }

  $value = ($line -replace "^\s*$([regex]::Escape($Name))\s*=", "").Trim()
  if (
    $value.Length -ge 2 -and
    (($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'")))
  ) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  return $value
}

function Get-ContainerDatabaseUrl {
  param([string]$ServiceName)

  $envPath = Join-Path $repositoryRoot (Join-Path $ServiceName ".env")
  $url = Get-DotEnvValue -Path $envPath -Name "DATABASE_URL"
  $databaseUri = [System.UriBuilder]::new($url)

  if ($databaseUri.Host -in @("localhost", "127.0.0.1", "::1")) {
    $databaseUri.Host = "host.docker.internal"
  }

  return $databaseUri.Uri.AbsoluteUri
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Không tìm thấy Docker CLI. Hãy cài và khởi động Docker Desktop."
}

Push-Location $repositoryRoot
$composeEnvironmentNames = @(
  "AUTH_DATABASE_URL",
  "SINHVIEN_DATABASE_URL",
  "DETAI_DATABASE_URL",
  "DANGKY_DATABASE_URL"
)
$previousComposeEnvironment = @{}
foreach ($name in $composeEnvironmentNames) {
  $previousComposeEnvironment[$name] = [Environment]::GetEnvironmentVariable(
    $name,
    [EnvironmentVariableTarget]::Process
  )
}

try {
  $env:AUTH_DATABASE_URL = Get-ContainerDatabaseUrl "auth-service"
  $env:SINHVIEN_DATABASE_URL = Get-ContainerDatabaseUrl "sinhvien-service"
  $env:DETAI_DATABASE_URL = Get-ContainerDatabaseUrl "detai-service"
  $env:DANGKY_DATABASE_URL = Get-ContainerDatabaseUrl "dangky-service"

  if ($Service -and $Action -in @("check", "down")) {
    throw "The $Action action does not accept a service. Use 'stop <service>' to stop one service."
  }

  if (-not $Service -and $Action -in @("start", "stop")) {
    throw "The $Action action requires a service name."
  }

  $composeArgs = @(switch ($Action) {
    "check" { @("config", "--quiet") }
    "up" { @("up", "--build", "-d") }
    "down" { @("down") }
    "start" { @("up", "--build", "-d", $Service) }
    "stop" { @("stop", $Service) }
    "restart" {
      if ($Service) {
        @("up", "--build", "-d", "--force-recreate", $Service)
      } else {
        @("up", "--build", "-d", "--force-recreate")
      }
    }
    "logs" { @("logs", "-f", "--tail=100") }
    "status" { @("ps") }
  })

  if ($Service -and $Action -in @("logs", "status")) {
    $composeArgs += $Service
  }

  & docker compose @composeArgs
  if ($LASTEXITCODE -ne 0) {
    throw "docker compose $Action failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
  foreach ($name in $composeEnvironmentNames) {
    [Environment]::SetEnvironmentVariable(
      $name,
      $previousComposeEnvironment[$name],
      [EnvironmentVariableTarget]::Process
    )
  }
}
