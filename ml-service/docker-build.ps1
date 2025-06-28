# PowerShell script to build and test PathCrafter ML Service Docker container

Write-Host "Building PathCrafter ML Service Docker Container..." -ForegroundColor Cyan

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t pathcrafter-ml-service:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker image built successfully!" -ForegroundColor Green
    Write-Host "Image: pathcrafter-ml-service:latest" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Testing the container locally..." -ForegroundColor Yellow
    
    # Stop any existing test container
    docker stop pathcrafter-ml-test 2>$null
    docker rm pathcrafter-ml-test 2>$null
    
    # Run container in detached mode
    $containerId = docker run -d -p 5001:5001 --name pathcrafter-ml-test pathcrafter-ml-service:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Container started with ID: $containerId" -ForegroundColor Green
        
        # Wait for container to start
        Write-Host "Waiting for container to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 8
        
        # Test health endpoint
        Write-Host "Testing health endpoint..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:5001/health" -Method Get -TimeoutSec 10
            Write-Host "Health check passed!" -ForegroundColor Green
            Write-Host "Service Status: $($response.status)" -ForegroundColor White
            Write-Host "Service Version: $($response.version)" -ForegroundColor White
        }
        catch {
            Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Show container logs
        Write-Host ""
        Write-Host "Container logs:" -ForegroundColor Yellow
        docker logs pathcrafter-ml-test --tail 10
        
        # Stop and remove test container
        Write-Host ""
        Write-Host "Cleaning up test container..." -ForegroundColor Yellow
        docker stop pathcrafter-ml-test
        docker rm pathcrafter-ml-test
        
    } else {
        Write-Host "Failed to start container" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Docker build completed successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Set up your .env file with API keys" -ForegroundColor White
    Write-Host "   2. Run: docker-compose up -d" -ForegroundColor White
    Write-Host "   3. Or deploy to Railway/Render" -ForegroundColor White
    
} else {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}
