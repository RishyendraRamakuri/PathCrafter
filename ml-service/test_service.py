import requests
import json

# Test data that matches your backend model
test_data = {
    "title": "Become a Full Stack Web Developer",
    "description": "I want to learn web development from scratch and build modern web applications",
    "goals": ["Learn React", "Build APIs", "Deploy applications"],
    "preferredDifficulty": "beginner",
    "availableTimePerWeek": 15,
    "durationWeeks": 16
}

def test_ml_service():
    """Test the ML service with sample data"""
    try:
        # Test health endpoint
        print("🔍 Testing health endpoint...")
        health_response = requests.get("http://localhost:5001/health")
        print(f"Health Status: {health_response.status_code}")
        print(f"Response: {health_response.json()}")
        print()
        
        # Test path generation
        print("🎯 Testing path generation...")
        response = requests.post(
            "http://localhost:5001/generate-path",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Generation Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            learning_path = result["learning_path"]
            
            print("✅ Learning Path Generated Successfully!")
            print(f"📋 Title: {learning_path['title']}")
            print(f"🎓 Domain: {learning_path['domain']}")
            print(f"📅 Duration: {learning_path['duration_weeks']} weeks")
            print(f"⏰ Total Hours: {learning_path['total_hours']}")
            print(f"🎯 Weekly Plan: {len(learning_path['weekly_plan'])} weeks planned")
            print(f"🏆 Milestones: {len(learning_path['milestones'])} milestones")
            print(f"📚 Resources: {sum(len(resources) for resources in learning_path['resources'].values())} resources")
            
            # Show first week details
            if learning_path['weekly_plan']:
                first_week = learning_path['weekly_plan'][0]
                print(f"\n📖 Week 1 Preview:")
                print(f"   Topic: {first_week['primary_topic']}")
                print(f"   Phase: {first_week['phase']}")
                print(f"   Activities: {len(first_week['activities'])} planned")
                
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_ml_service()
