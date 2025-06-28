"""
Script to help users set up API keys for the resource fetcher
"""
import os
import requests

def check_youtube_api():
    """Check if YouTube API key is working"""
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("❌ YouTube API key not found")
        print("📝 Get your free API key from: https://console.developers.google.com/")
        print("   1. Create a new project or select existing")
        print("   2. Enable YouTube Data API v3")
        print("   3. Create credentials (API key)")
        print("   4. Add to .env file: YOUTUBE_API_KEY=your_key_here")
        return False
    
    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": "python tutorial",
            "type": "video",
            "maxResults": 1,
            "key": api_key
        }
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            print("✅ YouTube API key is working!")
            return True
        else:
            print(f"❌ YouTube API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ YouTube API test failed: {str(e)}")
        return False

def check_github_api():
    """Check if GitHub token is working"""
    token = os.getenv('GITHUB_TOKEN')
    if not token:
        print("❌ GitHub token not found")
        print("📝 Get your free token from: https://github.com/settings/tokens")
        print("   1. Go to Settings > Developer settings > Personal access tokens")
        print("   2. Generate new token (classic)")
        print("   3. Select 'public_repo' scope")
        print("   4. Add to .env file: GITHUB_TOKEN=your_token_here")
        return False
    
    try:
        url = "https://api.github.com/search/repositories"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        params = {
            "q": "python tutorial",
            "sort": "stars",
            "per_page": 1
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            print("✅ GitHub token is working!")
            return True
        else:
            print(f"❌ GitHub API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ GitHub API test failed: {str(e)}")
        return False

def check_dev_to_api():
    """Check if Dev.to API is accessible"""
    try:
        url = "https://dev.to/api/articles"
        params = {"per_page": 1}
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            print("✅ Dev.to API is accessible!")
            return True
        else:
            print(f"❌ Dev.to API error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Dev.to API test failed: {str(e)}")
        return False

def main():
    """Main setup function"""
    print("🔧 PathCrafter API Setup Checker")
    print("=" * 50)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    print("\n📡 Checking API integrations...")
    
    youtube_ok = check_youtube_api()
    github_ok = check_github_api()
    dev_to_ok = check_dev_to_api()
    
    print("\n📊 Summary:")
    print(f"YouTube API: {'✅' if youtube_ok else '❌'}")
    print(f"GitHub API: {'✅' if github_ok else '❌'}")
    print(f"Dev.to API: {'✅' if dev_to_ok else '❌'}")
    
    if youtube_ok and github_ok and dev_to_ok:
        print("\n🎉 All APIs are working! Your PathCrafter service will have full functionality.")
    elif youtube_ok or github_ok:
        print("\n⚠️  Some APIs are working. The service will function with limited resources.")
    else:
        print("\n❌ No APIs are configured. The service will use fallback resources only.")
    
    print("\n💡 Tips:")
    print("- YouTube and GitHub APIs are free with generous limits")
    print("- Dev.to API requires no authentication")
    print("- Set up .env file with your API keys")
    print("- Restart the ML service after adding API keys")

if __name__ == "__main__":
    main()
