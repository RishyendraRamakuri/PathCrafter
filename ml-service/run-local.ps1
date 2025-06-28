<#
.SYNOPSIS
    Script to run PathCrafter ML Service locally with Docker
.DESCRIPTION
    Starts the ML service with proper environment configuration
    and performs health checks.
#>

# Clear screen and show header
Clear-Host
Write-Host "=== PathCrafter ML Service Local Runner ===" -ForegroundColor Cyan
Write-Host "Starting up...`n" -ForegroundColor White

# Verify critical environment variables
$requiredVars = @("YOUTUBE_API_KEY", "GITHUB_TOKEN")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not (Test-Path "env:$var")) {
        $missingVars += $var
    }
}

# Check Docker status
try {
    Write-Host "[1/4] Verifying Docker..." -NoNewline
    $null = docker info 2>$null
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Environment file check
Write-Host "[2/4] Checking environment..." -NoNewline
if (-not (Test-Path ".env")) {
    Write-Host " [MISSING]" -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" -Destination ".env"
        Write-Host "  Created .env from template" -ForegroundColor Yellow
        Write-Host "  Please configure these values:" -ForegroundColor Cyan
        Write-Host "  - YOUTUBE_API_KEY" -ForegroundColor White
        Write-Host "  - GITHUB_TOKEN" -ForegroundColor White
        exit 1
    } else {
        Write-Host " [ERROR]" -ForegroundColor Red
        Write-Host "  No .env or .env.example file found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host " [OK]" -ForegroundColor Green
}

# Cleanup previous containers
Write-Host "[3/4] Cleaning up..." -NoNewline
try {
    docker-compose down 2>$null
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [SKIPPED]" -ForegroundColor Yellow
}

# Start services
Write-Host "[4/4] Starting services..." -NoNewline
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "Failed to start containers. Check logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}
Write-Host " [OK]" -ForegroundColor Green

# Health check
Write-Host "`nPerforming health check..." -ForegroundColor Cyan
Start-Sleep -Seconds 5  # Give services time to start

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 10
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Version: $($response.version)" -ForegroundColor White
    Write-Host "`nService is healthy and running!" -ForegroundColor Green
} catch {
    Write-Host "  Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

# Display connection info
Write-Host "`nService Endpoints:" -ForegroundColor Cyan
Write-Host "  - Health:    http://localhost:5001/health" -ForegroundColor White
Write-Host "  - API Docs:  http://localhost:5001/docs" -ForegroundColor White
Write-Host "  - Generate:  http://localhost:5001/generate-path" -ForegroundColor White

Write-Host "`nManagement Commands:" -ForegroundColor Cyan
Write-Host "  - View logs:    docker-compose logs -f" -ForegroundColor White
Write-Host "  - Stop:        docker-compose down" -ForegroundColor White
Write-Host "  - Restart:     docker-compose restart" -ForegroundColor White

Write-Host "`n=== Ready ===" -ForegroundColor Green