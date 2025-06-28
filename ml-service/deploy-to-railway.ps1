Write-Host "Deploying PathCrafter ML Service to Railway..." -ForegroundColor Cyan

# Verify Railway CLI
try {
    $railwayInstalled = Get-Command railway -ErrorAction Stop
} catch {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    
    # Verify npm is available
    try {
        $npmInstalled = Get-Command npm -ErrorAction Stop
        npm install -g @railway/cli
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-Host "npm not found. Please install Node.js first:" -ForegroundColor Red
        Write-Host "   https://nodejs.org/" -ForegroundColor White
        exit 1
    }
}

# Check authentication
Write-Host "Checking Railway authentication..." -ForegroundColor Yellow
try {
    railway whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Please login to Railway..." -ForegroundColor Yellow
        railway login
    }
} catch {
    Write-Host "Failed to check Railway auth: $_" -ForegroundColor Red
    exit 1
}

# Verify working directory
if (-not (Test-Path (Join-Path $PWD.Path "enhanced_app.py"))) {
    Write-Host "Navigating to ml-service directory..." -ForegroundColor Yellow
    if (Test-Path "ml-service") {
        Set-Location ml-service
    } else {
        Write-Host "Error: Could not find ml-service directory or enhanced_app.py" -ForegroundColor Red
        exit 1
    }
}

# Initialize project
if (-not (Test-Path "railway.toml")) {
    Write-Host "Initializing Railway project..." -ForegroundColor Yellow
    railway init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize Railway project" -ForegroundColor Red
        exit 1
    }
}

# Deploy
Write-Host "Deploying to Railway..." -ForegroundColor Green
try {
    railway up
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment failed"
    }
    
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Your ML service is now live on Railway!" -ForegroundColor Cyan
    
    # Get deployment info
    railway status
    
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Set environment variables:" -ForegroundColor White
    Write-Host "   railway variables set YOUTUBE_API_KEY=your_key" -ForegroundColor Gray
    Write-Host "   railway variables set GITHUB_TOKEN=your_token" -ForegroundColor Gray
    
    Write-Host "2. Test your deployment:" -ForegroundColor White
    Write-Host "   Invoke-RestMethod -Uri 'https://your-app-url.railway.app/health'" -ForegroundColor Gray
    
} catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    exit 1
}