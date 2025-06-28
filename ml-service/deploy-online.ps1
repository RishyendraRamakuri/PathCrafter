# PowerShell script for online deployment options

Write-Host "PathCrafter ML Service - Online Deployment Options" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor White

Write-Host ""
Write-Host "Choose your deployment method:" -ForegroundColor Yellow
Write-Host "1. Railway (Recommended - Free tier available)" -ForegroundColor Green
Write-Host "2. Render (Free tier available)" -ForegroundColor Green
Write-Host "3. GitHub Codespaces (Online development)" -ForegroundColor Blue
Write-Host "4. Gitpod (Online development)" -ForegroundColor Blue

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Deploying to Railway..." -ForegroundColor Green
        Write-Host "1. Go to https://railway.app/" -ForegroundColor White
        Write-Host "2. Sign up with GitHub" -ForegroundColor White
        Write-Host "3. Click 'New Project' > 'Deploy from GitHub repo'" -ForegroundColor White
        Write-Host "4. Select your PathCrafter repository" -ForegroundColor White
        Write-Host "5. Set root directory to 'ml-service'" -ForegroundColor White
        Write-Host "6. Add environment variables in Railway dashboard:" -ForegroundColor White
        Write-Host "   - YOUTUBE_API_KEY=your_key" -ForegroundColor Cyan
        Write-Host "   - GITHUB_TOKEN=your_token" -ForegroundColor Cyan
        Write-Host "   - PORT=5001" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "Deploying to Render..." -ForegroundColor Green
        Write-Host "1. Go to https://render.com/" -ForegroundColor White
        Write-Host "2. Sign up with GitHub" -ForegroundColor White
        Write-Host "3. Click 'New' > 'Web Service'" -ForegroundColor White
        Write-Host "4. Connect your GitHub repository" -ForegroundColor White
        Write-Host "5. Set:" -ForegroundColor White
        Write-Host "   - Root Directory: ml-service" -ForegroundColor Cyan
        Write-Host "   - Build Command: pip install -r requirements.txt" -ForegroundColor Cyan
        Write-Host "   - Start Command: python enhanced_app.py" -ForegroundColor Cyan
        Write-Host "6. Add environment variables in Render dashboard" -ForegroundColor White
    }
    "3" {
        Write-Host "Using GitHub Codespaces..." -ForegroundColor Blue
        Write-Host "1. Go to your GitHub repository" -ForegroundColor White
        Write-Host "2. Click 'Code' > 'Codespaces' > 'Create codespace'" -ForegroundColor White
        Write-Host "3. Wait for environment to load" -ForegroundColor White
        Write-Host "4. In the terminal, run:" -ForegroundColor White
        Write-Host "   cd ml-service" -ForegroundColor Cyan
        Write-Host "   pip install -r requirements.txt" -ForegroundColor Cyan
        Write-Host "   python enhanced_app.py" -ForegroundColor Cyan
    }
    "4" {
        Write-Host "Using Gitpod..." -ForegroundColor Blue
        Write-Host "1. Go to https://gitpod.io/" -ForegroundColor White
        Write-Host "2. Sign in with GitHub" -ForegroundColor White
        Write-Host "3. Open: https://gitpod.io/#your-github-repo-url" -ForegroundColor White
        Write-Host "4. In the terminal, run:" -ForegroundColor White
        Write-Host "   cd ml-service" -ForegroundColor Cyan
        Write-Host "   pip install -r requirements.txt" -ForegroundColor Cyan
        Write-Host "   python enhanced_app.py" -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "After deployment, test your service:" -ForegroundColor Yellow
Write-Host "Invoke-RestMethod -Uri 'https://your-app-url/health'" -ForegroundColor Cyan
