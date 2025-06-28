import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test data for different domains
test_cases = [
    {
        "name": "Web Development - Frontend",
        "data": {
            "title": "Become a Frontend React Developer",
            "description": "I want to learn React and build modern web applications",
            "goals": ["Learn React", "Build responsive UIs", "Master JavaScript"],
            "preferredDifficulty": "beginner",
            "availableTimePerWeek": 12,
            "durationWeeks": 12,
            "preferredTopics": ["React", "JavaScript", "CSS", "HTML"]
        }
    },
    {
        "name": "Data Science - Machine Learning",
        "data": {
            "title": "Machine Learning Engineer Path",
            "description": "Learn machine learning and build predictive models",
            "goals": ["Build ML models", "Learn Python", "Work with data"],
            "preferredDifficulty": "intermediate",
            "availableTimePerWeek": 15,
            "durationWeeks": 16,
            "preferredTopics": ["Python", "Machine Learning", "TensorFlow", "Data Analysis"]
        }
    },
    {
        "name": "Mobile Development - React Native",
        "data": {
            "title": "Cross-Platform Mobile Developer",
            "description": "Build mobile apps for iOS and Android using React Native",
            "goals": ["Build mobile apps", "Learn React Native", "Deploy to app stores"],
            "preferredDifficulty": "intermediate",
            "availableTimePerWeek": 10,
            "durationWeeks": 14,
            "preferredTopics": ["React Native", "Mobile Development", "JavaScript"]
        }
    }
]

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        print("🔍 Testing health endpoint...")
        response = requests.get("http://localhost:5001/health")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   Service: {data['service']}")
            print(f"   Version: {data['version']}")
            print(f"   API Integrations:")
            for api, status in data['api_integrations'].items():
                print(f"     - {api}: {'✅' if status else '❌'}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_domains_endpoint():
    """Test the domains endpoint"""
    try:
        print("\n🌐 Testing domains endpoint...")
        response = requests.get("http://localhost:5001/domains")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Domains endpoint working!")
            print(f"   Total domains: {data['total_domains']}")
            print("   Available domains:")
            for domain, info in data['domains'].items():
                print(f"     - {info['name']}: {len(info['subdomains'])} subdomains")
            return True
        else:
            print(f"❌ Domains endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Domains endpoint error: {str(e)}")
        return False

def test_resource_preview():
    """Test the resource preview endpoint"""
    try:
        print("\n📚 Testing resource preview...")
        test_data = {
            "domain": "web-development",
            "subdomain": "frontend",
            "difficulty": "beginner"
        }
        
        response = requests.post(
            "http://localhost:5001/resources/preview",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Resource preview working!")
            preview = data['preview']
            print(f"   Videos: {len(preview.get('videos', []))}")
            print(f"   Projects: {len(preview.get('projects', []))}")
            print(f"   Articles: {len(preview.get('articles', []))}")
            print(f"   Courses: {len(preview.get('courses', []))}")
            
            # Show sample resources
            if preview.get('videos'):
                print(f"   Sample video: {preview['videos'][0]['title']}")
            if preview.get('projects'):
                print(f"   Sample project: {preview['projects'][0]['title']}")
                
            return True
        else:
            print(f"❌ Resource preview failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Resource preview error: {str(e)}")
        return False

def test_path_generation(test_case):
    """Test path generation with real data"""
    try:
        print(f"\n🎯 Testing path generation: {test_case['name']}")
        
        response = requests.post(
            "http://localhost:5001/generate-path",
            json=test_case['data'],
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            learning_path = result["learning_path"]
            
            print("✅ Path generation successful!")
            print(f"   📋 Title: {learning_path['title']}")
            print(f"   🎓 Domain: {learning_path['domain']} ({learning_path.get('subdomain', 'N/A')})")
            print(f"   📅 Duration: {learning_path['duration_weeks']} weeks")
            print(f"   ⏰ Total Hours: {learning_path['total_hours']}")
            print(f"   🎯 Weekly Plan: {len(learning_path['weekly_plan'])} weeks")
            print(f"   🏆 Milestones: {len(learning_path['milestones'])} milestones")
            
            # Resource counts
            resource_count = result.get('resource_count', {})
            print(f"   📚 Resources:")
            print(f"     - Videos: {resource_count.get('videos', 0)}")
            print(f"     - Projects: {resource_count.get('projects', 0)}")
            print(f"     - Articles: {resource_count.get('articles', 0)}")
            print(f"     - Total: {resource_count.get('total', 0)}")
            
            # Show first week details
            if learning_path['weekly_plan']:
                first_week = learning_path['weekly_plan'][0]
                print(f"\n   📖 Week 1 Preview:")
                print(f"      Topic: {first_week['primary_topic']}")
                print(f"      Phase: {first_week['phase']}")
                print(f"      Activities: {len(first_week['activities'])}")
                print(f"      Resources: {len(first_week.get('resources_needed', []))}")
                
                # Show sample resources
                if first_week.get('resources_needed'):
                    sample_resource = first_week['resources_needed'][0]
                    print(f"      Sample resource: {sample_resource.get('title', 'N/A')}")
            
            return True
        else:
            error_data = response.json()
            print(f"❌ Path generation failed: {response.status_code}")
            print(f"   Error: {error_data.get('message', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Path generation error: {str(e)}")
        return False

def test_validation():
    """Test input validation"""
    try:
        print("\n✅ Testing input validation...")
        
        test_input = {
            "title": "Learn React and build awesome apps",
            "description": "I want to become a frontend developer",
            "goals": ["Learn React", "Build projects"],
            "preferredDifficulty": "beginner",
            "availableTimePerWeek": 8,
            "durationWeeks": 10,
            "preferredTopics": ["React", "JavaScript"]
        }
        
        response = requests.post(
            "http://localhost:5001/validate-input",
            json=test_input,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            validation = data['validation']
            
            print("✅ Validation working!")
            print(f"   Suggested domain: {validation['suggested_domain']}")
            print(f"   Suggested subdomain: {validation['suggested_subdomain']}")
            print(f"   Confidence: {validation['confidence']:.2f}")
            
            if validation['warnings']:
                print(f"   Warnings: {len(validation['warnings'])}")
            if validation['suggestions']:
                print(f"   Suggestions: {len(validation['suggestions'])}")
                
            return True
        else:
            print(f"❌ Validation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Validation error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🧪 PathCrafter Enhanced ML Service Test Suite")
    print("=" * 60)
    
    # Check if APIs are configured
    youtube_key = os.getenv('YOUTUBE_API_KEY')
    github_token = os.getenv('GITHUB_TOKEN')
    
    print(f"🔑 API Configuration:")
    print(f"   YouTube API: {'✅ Configured' if youtube_key else '❌ Not configured'}")
    print(f"   GitHub API: {'✅ Configured' if github_token else '❌ Not configured'}")
    
    if not youtube_key and not github_token:
        print("\n⚠️  No APIs configured. Tests will use fallback resources.")
        print("   Run 'python setup_apis.py' to configure APIs for full functionality.")
    
    # Run tests
    tests_passed = 0
    total_tests = 0
    
    # Basic endpoint tests
    total_tests += 1
    if test_health_endpoint():
        tests_passed += 1
    
    total_tests += 1
    if test_domains_endpoint():
        tests_passed += 1
    
    total_tests += 1
    if test_resource_preview():
        tests_passed += 1
    
    total_tests += 1
    if test_validation():
        tests_passed += 1
    
    # Path generation tests
    for test_case in test_cases:
        total_tests += 1
        if test_path_generation(test_case):
            tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Your PathCrafter service is fully functional.")
    elif tests_passed >= total_tests * 0.7:
        print("✅ Most tests passed. Service is working with some limitations.")
    else:
        print("❌ Many tests failed. Check your service configuration.")
    
    print("\n💡 Next steps:")
    print("   1. Configure API keys for full functionality")
    print("   2. Start the backend service")
    print("   3. Test the frontend integration")
    print("   4. Deploy to production")

if __name__ == "__main__":
    main()
