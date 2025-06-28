from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
CORS(app)

# Comprehensive Learning Content Database
LEARNING_DATABASE = {
    "web development": {
        "beginner": {
            "prerequisites": ["Basic computer skills", "Text editor familiarity"],
            "learning_objectives": [
                "Build responsive websites with HTML and CSS",
                "Create interactive web pages with JavaScript",
                "Understand web development fundamentals",
                "Deploy websites to the internet",
                "Use version control with Git"
            ],
            "topics": [
                {
                    "name": "HTML Fundamentals",
                    "subtopics": ["HTML Structure", "Semantic Elements", "Forms", "Tables", "Media Elements"],
                    "estimated_hours": 8,
                    "difficulty": "beginner"
                },
                {
                    "name": "CSS Styling",
                    "subtopics": ["Selectors", "Box Model", "Flexbox", "Grid", "Responsive Design"],
                    "estimated_hours": 12,
                    "difficulty": "beginner"
                },
                {
                    "name": "JavaScript Basics",
                    "subtopics": ["Variables", "Functions", "DOM Manipulation", "Events", "ES6 Features"],
                    "estimated_hours": 16,
                    "difficulty": "beginner"
                },
                {
                    "name": "Version Control",
                    "subtopics": ["Git Basics", "GitHub", "Branching", "Collaboration"],
                    "estimated_hours": 6,
                    "difficulty": "beginner"
                },
                {
                    "name": "Web Deployment",
                    "subtopics": ["Hosting Platforms", "Domain Setup", "FTP", "Static Site Deployment"],
                    "estimated_hours": 4,
                    "difficulty": "beginner"
                }
            ],
            "resources": [
                {
                    "title": "MDN Web Docs - HTML",
                    "url": "https://developer.mozilla.org/en-US/docs/Web/HTML",
                    "type": "documentation",
                    "estimated_time": "3-4 hours",
                    "topics": ["HTML Fundamentals"],
                    "free": True
                },
                {
                    "title": "FreeCodeCamp - Responsive Web Design",
                    "url": "https://www.freecodecamp.org/learn/responsive-web-design/",
                    "type": "interactive_course",
                    "estimated_time": "300 hours",
                    "topics": ["HTML Fundamentals", "CSS Styling"],
                    "free": True
                },
                {
                    "title": "JavaScript.info",
                    "url": "https://javascript.info/",
                    "type": "tutorial",
                    "estimated_time": "50+ hours",
                    "topics": ["JavaScript Basics"],
                    "free": True
                },
                {
                    "title": "Git Handbook",
                    "url": "https://guides.github.com/introduction/git-handbook/",
                    "type": "guide",
                    "estimated_time": "2 hours",
                    "topics": ["Version Control"],
                    "free": True
                },
                {
                    "title": "Netlify Deployment Guide",
                    "url": "https://docs.netlify.com/",
                    "type": "documentation",
                    "estimated_time": "1 hour",
                    "topics": ["Web Deployment"],
                    "free": True
                }
            ],
            "projects": [
                {
                    "title": "Personal Portfolio Website",
                    "description": "Create a responsive portfolio showcasing your skills and projects",
                    "estimated_hours": 15,
                    "skills_practiced": ["HTML Fundamentals", "CSS Styling", "Web Deployment"],
                    "deliverables": ["Live website", "Source code on GitHub", "Responsive design"],
                    "difficulty": "beginner"
                },
                {
                    "title": "Interactive Landing Page",
                    "description": "Build a business landing page with interactive elements",
                    "estimated_hours": 20,
                    "skills_practiced": ["HTML Fundamentals", "CSS Styling", "JavaScript Basics"],
                    "deliverables": ["Interactive website", "Form validation", "Smooth animations"],
                    "difficulty": "beginner"
                },
                {
                    "title": "Task Management App",
                    "description": "Create a simple todo application with local storage",
                    "estimated_hours": 25,
                    "skills_practiced": ["JavaScript Basics", "DOM Manipulation", "Local Storage"],
                    "deliverables": ["Functional todo app", "Data persistence", "User interface"],
                    "difficulty": "beginner"
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["HTML/CSS proficiency", "JavaScript fundamentals", "Basic programming concepts"],
            "learning_objectives": [
                "Build dynamic web applications with React",
                "Create backend APIs with Node.js and Express",
                "Work with databases and data persistence",
                "Implement user authentication and authorization",
                "Deploy full-stack applications"
            ],
            "topics": [
                {
                    "name": "React Fundamentals",
                    "subtopics": ["Components", "Props & State", "Event Handling", "Lifecycle Methods", "Hooks"],
                    "estimated_hours": 20,
                    "difficulty": "intermediate"
                },
                {
                    "name": "Node.js & Express",
                    "subtopics": ["Server Setup", "Routing", "Middleware", "API Development", "Error Handling"],
                    "estimated_hours": 18,
                    "difficulty": "intermediate"
                },
                {
                    "name": "Database Integration",
                    "subtopics": ["MongoDB", "Mongoose", "CRUD Operations", "Data Modeling", "Relationships"],
                    "estimated_hours": 16,
                    "difficulty": "intermediate"
                },
                {
                    "name": "Authentication & Security",
                    "subtopics": ["JWT Tokens", "Password Hashing", "Protected Routes", "User Sessions"],
                    "estimated_hours": 12,
                    "difficulty": "intermediate"
                },
                {
                    "name": "Full-Stack Integration",
                    "subtopics": ["API Integration", "State Management", "Error Handling", "Deployment"],
                    "estimated_hours": 14,
                    "difficulty": "intermediate"
                }
            ],
            "resources": [
                {
                    "title": "React Official Documentation",
                    "url": "https://react.dev/",
                    "type": "documentation",
                    "estimated_time": "10+ hours",
                    "topics": ["React Fundamentals"],
                    "free": True
                },
                {
                    "title": "Node.js Complete Guide",
                    "url": "https://nodejs.org/en/docs/",
                    "type": "documentation",
                    "estimated_time": "8+ hours",
                    "topics": ["Node.js & Express"],
                    "free": True
                },
                {
                    "title": "MongoDB University",
                    "url": "https://university.mongodb.com/",
                    "type": "course",
                    "estimated_time": "20+ hours",
                    "topics": ["Database Integration"],
                    "free": True
                }
            ],
            "projects": [
                {
                    "title": "Social Media Dashboard",
                    "description": "Build a full-stack social media management application",
                    "estimated_hours": 40,
                    "skills_practiced": ["React Fundamentals", "Node.js & Express", "Database Integration", "Authentication & Security"],
                    "deliverables": ["User authentication", "Post creation/editing", "Real-time updates", "Responsive design"],
                    "difficulty": "intermediate"
                },
                {
                    "title": "E-commerce Platform",
                    "description": "Create a complete online store with payment integration",
                    "estimated_hours": 60,
                    "skills_practiced": ["Full-Stack Integration", "Database Integration", "Authentication & Security"],
                    "deliverables": ["Product catalog", "Shopping cart", "User accounts", "Order management"],
                    "difficulty": "intermediate"
                }
            ]
        },
        "advanced": {
            "prerequisites": ["React proficiency", "Node.js experience", "Database knowledge", "API development"],
            "learning_objectives": [
                "Architect scalable web applications",
                "Implement advanced React patterns and optimization",
                "Build microservices and distributed systems",
                "Master DevOps and deployment strategies",
                "Implement real-time features and performance optimization"
            ],
            "topics": [
                {
                    "name": "Advanced React Patterns",
                    "subtopics": ["Context API", "Custom Hooks", "Performance Optimization", "Testing", "TypeScript"],
                    "estimated_hours": 25,
                    "difficulty": "advanced"
                },
                {
                    "name": "Microservices Architecture",
                    "subtopics": ["Service Design", "API Gateway", "Inter-service Communication", "Data Consistency"],
                    "estimated_hours": 30,
                    "difficulty": "advanced"
                },
                {
                    "name": "DevOps & Deployment",
                    "subtopics": ["Docker", "CI/CD Pipelines", "Cloud Platforms", "Monitoring", "Scaling"],
                    "estimated_hours": 28,
                    "difficulty": "advanced"
                },
                {
                    "name": "Performance & Security",
                    "subtopics": ["Code Splitting", "Caching Strategies", "Security Best Practices", "Load Testing"],
                    "estimated_hours": 22,
                    "difficulty": "advanced"
                }
            ],
            "resources": [
                {
                    "title": "Advanced React Patterns",
                    "url": "https://kentcdodds.com/blog/",
                    "type": "blog",
                    "estimated_time": "15+ hours",
                    "topics": ["Advanced React Patterns"],
                    "free": True
                },
                {
                    "title": "Docker Documentation",
                    "url": "https://docs.docker.com/",
                    "type": "documentation",
                    "estimated_time": "20+ hours",
                    "topics": ["DevOps & Deployment"],
                    "free": True
                }
            ],
            "projects": [
                {
                    "title": "Real-time Collaboration Platform",
                    "description": "Build a Slack-like application with real-time messaging and collaboration features",
                    "estimated_hours": 80,
                    "skills_practiced": ["Advanced React Patterns", "Microservices Architecture", "Performance & Security"],
                    "deliverables": ["Real-time messaging", "File sharing", "Video calls", "Team management"],
                    "difficulty": "advanced"
                }
            ]
        }
    },
    "data science": {
        "beginner": {
            "prerequisites": ["Basic mathematics", "Computer literacy"],
            "learning_objectives": [
                "Analyze data using Python and pandas",
                "Create meaningful data visualizations",
                "Understand statistical concepts for data analysis",
                "Clean and prepare data for analysis",
                "Build basic machine learning models"
            ],
            "topics": [
                {
                    "name": "Python for Data Science",
                    "subtopics": ["Python Basics", "NumPy", "Pandas", "Data Structures", "File I/O"],
                    "estimated_hours": 20,
                    "difficulty": "beginner"
                },
                {
                    "name": "Data Visualization",
                    "subtopics": ["Matplotlib", "Seaborn", "Plotly", "Chart Types", "Dashboard Creation"],
                    "estimated_hours": 15,
                    "difficulty": "beginner"
                },
                {
                    "name": "Statistics & Probability",
                    "subtopics": ["Descriptive Statistics", "Probability Distributions", "Hypothesis Testing", "Correlation"],
                    "estimated_hours": 18,
                    "difficulty": "beginner"
                },
                {
                    "name": "Data Cleaning & Preparation",
                    "subtopics": ["Missing Data", "Outliers", "Data Transformation", "Feature Engineering"],
                    "estimated_hours": 12,
                    "difficulty": "beginner"
                }
            ],
            "resources": [
                {
                    "title": "Kaggle Learn - Python",
                    "url": "https://www.kaggle.com/learn/python",
                    "type": "interactive_course",
                    "estimated_time": "7 hours",
                    "topics": ["Python for Data Science"],
                    "free": True
                },
                {
                    "title": "Pandas Documentation",
                    "url": "https://pandas.pydata.org/docs/",
                    "type": "documentation",
                    "estimated_time": "10+ hours",
                    "topics": ["Python for Data Science"],
                    "free": True
                }
            ],
            "projects": [
                {
                    "title": "Sales Data Analysis",
                    "description": "Analyze e-commerce sales data to identify trends and insights",
                    "estimated_hours": 25,
                    "skills_practiced": ["Python for Data Science", "Data Visualization", "Statistics & Probability"],
                    "deliverables": ["Data analysis report", "Interactive visualizations", "Business recommendations"],
                    "difficulty": "beginner"
                }
            ]
        }
    }
}

class AdvancedLearningPathGenerator:
    def __init__(self):
        self.database = LEARNING_DATABASE
    
    def analyze_user_input(self, user_input):
        """Comprehensive analysis of user input to determine optimal learning path"""
        goal_title = user_input.get('title', '').lower()
        description = user_input.get('description', '').lower()
        goals = user_input.get('goals', [])
        
        # Combine all text for analysis
        combined_text = f"{goal_title} {description} {' '.join(goals)}".lower()
        
        # Domain detection with scoring
        domain_scores = {}
        
        web_keywords = ['web', 'frontend', 'backend', 'fullstack', 'react', 'javascript', 'html', 'css', 'node', 'express', 'website', 'app']
        data_keywords = ['data', 'analytics', 'machine learning', 'ai', 'pandas', 'python', 'statistics', 'visualization', 'analysis']
        
        domain_scores['web development'] = sum(1 for keyword in web_keywords if keyword in combined_text)
        domain_scores['data science'] = sum(1 for keyword in data_keywords if keyword in combined_text)
        
        # Determine primary domain
        primary_domain = max(domain_scores, key=domain_scores.get) if max(domain_scores.values()) > 0 else 'web development'
        
        return {
            'domain': primary_domain,
            'confidence': max(domain_scores.values()) / len(combined_text.split()) if combined_text else 0.5
        }
    
    def generate_detailed_weekly_plan(self, domain, difficulty, duration_weeks, hours_per_week, user_goals):
        """Generate comprehensive weekly learning plan with detailed activities"""
        if domain not in self.database or difficulty not in self.database[domain]:
            return []
        
        content = self.database[domain][difficulty]
        topics = content['topics']
        projects = content.get('projects', [])
        
        weekly_plan = []
        total_topic_hours = sum(topic['estimated_hours'] for topic in topics)
        hours_per_topic = hours_per_week * duration_weeks / len(topics) if topics else hours_per_week
        
        current_week = 1
        current_topic_index = 0
        
        while current_week <= duration_weeks and current_topic_index < len(topics):
            topic = topics[current_topic_index]
            weeks_for_topic = max(1, round(topic['estimated_hours'] / hours_per_week))
            
            for week_in_topic in range(weeks_for_topic):
                if current_week > duration_weeks:
                    break
                
                # Determine learning phase
                progress_percentage = current_week / duration_weeks
                if progress_percentage <= 0.3:
                    phase = "Foundation Building"
                    focus = "Understanding core concepts and building fundamental skills"
                elif progress_percentage <= 0.7:
                    phase = "Skill Development"
                    focus = "Applying knowledge through hands-on practice and projects"
                else:
                    phase = "Mastery & Integration"
                    focus = "Advanced implementation and portfolio development"
                
                # Generate specific activities for the week
                activities = self.generate_weekly_activities(topic, week_in_topic, weeks_for_topic, phase)
                
                # Calculate deliverables
                deliverables = self.generate_weekly_deliverables(topic, week_in_topic, weeks_for_topic)
                
                weekly_plan.append({
                    "week": current_week,
                    "phase": phase,
                    "focus": focus,
                    "primary_topic": topic['name'],
                    "subtopics": topic['subtopics'][week_in_topic:week_in_topic+2] if week_in_topic < len(topic['subtopics']) else topic['subtopics'][-2:],
                    "learning_objectives": self.generate_weekly_objectives(topic, week_in_topic),
                    "activities": activities,
                    "deliverables": deliverables,
                    "estimated_hours": hours_per_week,
                    "difficulty_level": topic['difficulty'],
                    "resources_needed": self.get_topic_resources(domain, difficulty, topic['name']),
                    "assessment": self.generate_weekly_assessment(topic, week_in_topic)
                })
                
                current_week += 1
            
            current_topic_index += 1
        
        # Add project weeks if there's remaining time
        if current_week <= duration_weeks and projects:
            project_weeks = duration_weeks - current_week + 1
            for i, project in enumerate(projects[:project_weeks]):
                if current_week <= duration_weeks:
                    weekly_plan.append({
                        "week": current_week,
                        "phase": "Project Implementation",
                        "focus": "Building real-world applications to demonstrate mastery",
                        "primary_topic": "Capstone Project",
                        "project": project,
                        "learning_objectives": [f"Complete {project['title']}", "Apply learned concepts in practice"],
                        "activities": [
                            "Project planning and setup",
                            "Implementation and development",
                            "Testing and debugging",
                            "Documentation and deployment"
                        ],
                        "deliverables": project['deliverables'],
                        "estimated_hours": hours_per_week,
                        "difficulty_level": project['difficulty'],
                        "skills_practiced": project['skills_practiced']
                    })
                    current_week += 1
        
        return weekly_plan
    
    def generate_weekly_activities(self, topic, week_in_topic, total_weeks, phase):
        """Generate specific activities for each week"""
        base_activities = [
            f"Study {topic['name']} fundamentals",
            f"Complete hands-on exercises for {topic['subtopics'][0] if topic['subtopics'] else topic['name']}",
            "Practice coding/implementation",
            "Review and reinforce learning"
        ]
        
        if phase == "Foundation Building":
            return [
                f"Read documentation and tutorials on {topic['name']}",
                f"Watch video lectures covering {', '.join(topic['subtopics'][:2])}",
                "Complete guided exercises and examples",
                "Take notes and create concept summaries",
                "Join online communities and forums for support"
            ]
        elif phase == "Skill Development":
            return [
                f"Build mini-projects using {topic['name']}",
                "Solve coding challenges and problems",
                "Participate in code reviews and discussions",
                "Experiment with different approaches and techniques",
                "Create documentation for your learning progress"
            ]
        else:  # Mastery & Integration
            return [
                f"Implement advanced {topic['name']} features",
                "Optimize and refactor previous work",
                "Mentor others or teach concepts you've learned",
                "Contribute to open-source projects",
                "Prepare portfolio pieces and case studies"
            ]
    
    def generate_weekly_deliverables(self, topic, week_in_topic, total_weeks):
        """Generate specific deliverables for each week"""
        return [
            f"Completed exercises for {topic['name']}",
            f"Summary notes on {', '.join(topic['subtopics'][:2])}",
            "Code samples and examples",
            "Weekly reflection and progress report"
        ]
    
    def generate_weekly_objectives(self, topic, week_in_topic):
        """Generate specific learning objectives for each week"""
        return [
            f"Understand core concepts of {topic['name']}",
            f"Apply {topic['subtopics'][0] if topic['subtopics'] else topic['name']} in practical scenarios",
            "Build confidence through hands-on practice",
            "Identify areas for further improvement"
        ]
    
    def get_topic_resources(self, domain, difficulty, topic_name):
        """Get resources specific to a topic"""
        all_resources = self.database[domain][difficulty]['resources']
        return [r for r in all_resources if topic_name in r.get('topics', [])][:3]
    
    def generate_weekly_assessment(self, topic, week_in_topic):
        """Generate assessment criteria for each week"""
        return {
            "self_assessment_questions": [
                f"Can I explain the key concepts of {topic['name']}?",
                f"Am I comfortable implementing {topic['subtopics'][0] if topic['subtopics'] else topic['name']}?",
                "What challenges did I face this week?",
                "What would I like to explore further?"
            ],
            "practical_checkpoints": [
                "Complete all assigned exercises",
                "Successfully implement code examples",
                "Explain concepts to someone else",
                "Apply learning to a small project"
            ]
        }
    
    def generate_comprehensive_milestones(self, weekly_plan, domain, difficulty):
        """Generate detailed milestones with specific criteria"""
        total_weeks = len(weekly_plan)
        milestones = []
        
        # Calculate milestone weeks
        milestone_points = [
            (total_weeks // 4, "Foundation Milestone"),
            (total_weeks // 2, "Development Milestone"),
            ((3 * total_weeks) // 4, "Integration Milestone"),
            (total_weeks, "Mastery Milestone")
        ]
        
        for week, title in milestone_points:
            if week > 0:
                # Get relevant weeks for this milestone
                relevant_weeks = weekly_plan[:week]
                
                # Calculate cumulative learning
                topics_covered = list(set([w.get('primary_topic', '') for w in relevant_weeks]))
                total_hours = sum([w.get('estimated_hours', 0) for w in relevant_weeks])
                
                milestone = {
                    "id": str(uuid.uuid4()),
                    "title": title,
                    "description": f"Complete weeks 1-{week} of your {domain} learning journey",
                    "target_week": week,
                    "completion_criteria": [
                        f"Master {len(topics_covered)} core topics: {', '.join(topics_covered[:3])}{'...' if len(topics_covered) > 3 else ''}",
                        f"Complete {total_hours} hours of structured learning",
                        "Pass all weekly self-assessments",
                        "Build and deploy at least one project"
                    ],
                    "skills_acquired": topics_covered,
                    "estimated_hours": total_hours,
                    "reward": f"Certificate of completion for {title}",
                    "next_steps": f"Proceed to advanced topics in {domain}",
                    "completed": False,
                    "completion_date": None
                }
                milestones.append(milestone)
        
        return milestones
    
    def generate_comprehensive_resources(self, domain, difficulty):
        """Get comprehensive resource list with categorization"""
        if domain not in self.database or difficulty not in self.database[domain]:
            return []
        
        resources = self.database[domain][difficulty]['resources']
        
        # Categorize resources
        categorized_resources = {
            "documentation": [],
            "interactive_course": [],
            "tutorial": [],
            "video": [],
            "book": [],
            "practice": [],
            "community": []
        }
        
        for resource in resources:
            resource_type = resource.get('type', 'tutorial')
            if resource_type in categorized_resources:
                categorized_resources[resource_type].append(resource)
            else:
                categorized_resources['tutorial'].append(resource)
        
        # Add some universal resources
        universal_resources = [
            {
                "title": "Stack Overflow",
                "url": "https://stackoverflow.com",
                "type": "community",
                "description": "Get help with coding questions and problems",
                "free": True
            },
            {
                "title": "GitHub",
                "url": "https://github.com",
                "type": "practice",
                "description": "Version control and code collaboration platform",
                "free": True
            }
        ]
        
        categorized_resources['community'].extend(universal_resources[:1])
        categorized_resources['practice'].extend(universal_resources[1:])
        
        return categorized_resources
    
    def calculate_learning_metrics(self, weekly_plan, duration_weeks, hours_per_week):
        """Calculate comprehensive learning metrics"""
        total_hours = duration_weeks * hours_per_week
        total_topics = len(set([w.get('primary_topic', '') for w in weekly_plan]))
        
        # Calculate difficulty distribution
        difficulty_distribution = {}
        for week in weekly_plan:
            diff = week.get('difficulty_level', 'beginner')
            difficulty_distribution[diff] = difficulty_distribution.get(diff, 0) + 1
        
        return {
            "total_learning_hours": total_hours,
            "total_topics_covered": total_topics,
            "average_hours_per_topic": total_hours / total_topics if total_topics > 0 else 0,
            "difficulty_distribution": difficulty_distribution,
            "estimated_completion_rate": 0.85,  # Based on typical completion rates
            "recommended_study_schedule": f"{hours_per_week} hours per week over {duration_weeks} weeks"
        }
    
    def generate_path(self, user_input):
        """Generate a comprehensive, production-ready learning path"""
        try:
            # Extract and validate user input
            title = user_input.get('title', '')
            description = user_input.get('description', '')
            goals = user_input.get('goals', [])
            duration_weeks = int(user_input.get('durationWeeks', 12))
            difficulty = user_input.get('preferredDifficulty', 'beginner').lower()
            hours_per_week = int(user_input.get('availableTimePerWeek', 10))
            
            # Analyze user input to determine optimal path
            analysis = self.analyze_user_input(user_input)
            domain = analysis['domain']
            
            # Validate domain and difficulty
            if domain not in self.database:
                domain = 'web development'  # fallback
            if difficulty not in self.database[domain]:
                difficulty = 'beginner'  # fallback
            
            # Get domain-specific content
            domain_content = self.database[domain][difficulty]
            
            # Generate comprehensive components
            weekly_plan = self.generate_detailed_weekly_plan(domain, difficulty, duration_weeks, hours_per_week, goals)
            milestones = self.generate_comprehensive_milestones(weekly_plan, domain, difficulty)
            resources = self.generate_comprehensive_resources(domain, difficulty)
            learning_metrics = self.calculate_learning_metrics(weekly_plan, duration_weeks, hours_per_week)
            
            # Calculate dates
            start_date = datetime.now()
            completion_date = start_date + timedelta(weeks=duration_weeks)
            
            # Create comprehensive learning path
            learning_path = {
                "id": str(uuid.uuid4()),
                "title": title,
                "description": description,
                "overview": f"This comprehensive {duration_weeks}-week {difficulty}-level learning path in {domain} "
                           f"is designed to help you achieve: {title}. You'll invest {hours_per_week} hours per week "
                           f"in structured learning, hands-on projects, and skill development.",
                
                # Core path information
                "domain": domain,
                "difficulty": difficulty,
                "duration_weeks": duration_weeks,
                "hours_per_week": hours_per_week,
                "total_hours": duration_weeks * hours_per_week,
                
                # Learning structure
                "prerequisites": domain_content['prerequisites'],
                "learning_objectives": domain_content['learning_objectives'],
                "weekly_plan": weekly_plan,
                "milestones": milestones,
                "resources": resources,
                "projects": domain_content.get('projects', []),
                
                # Metrics and tracking
                "learning_metrics": learning_metrics,
                "progress_tracking": {
                    "completed_weeks": 0,
                    "completed_milestones": 0,
                    "total_hours_logged": 0,
                    "current_week": 1,
                    "completion_percentage": 0
                },
                
                # Dates
                "created_at": start_date.isoformat(),
                "start_date": start_date.isoformat(),
                "estimated_completion": completion_date.isoformat(),
                "last_updated": start_date.isoformat(),
                
                # Metadata
                "version": "1.0",
                "generated_by": "PathCrafter ML Service",
                "confidence_score": analysis['confidence']
            }
            
            return {
                "success": True,
                "learning_path": learning_path,
                "message": f"Comprehensive {domain} learning path generated successfully!",
                "generation_time": datetime.now().isoformat(),
                "path_id": learning_path["id"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate comprehensive learning path",
                "timestamp": datetime.now().isoformat()
            }

# Initialize the advanced generator
path_generator = AdvancedLearningPathGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check with service information"""
    return jsonify({
        "status": "healthy",
        "service": "PathCrafter Advanced ML Service",
        "version": "1.0.0",
        "capabilities": [
            "Comprehensive learning path generation",
            "Multi-domain support (Web Development, Data Science)",
            "Detailed weekly planning with activities and deliverables",
            "Progress tracking and milestone management",
            "Curated resource recommendations",
            "Project-based learning integration"
        ],
        "supported_domains": list(LEARNING_DATABASE.keys()),
        "supported_difficulties": ["beginner", "intermediate", "advanced"],
        "timestamp": datetime.now().isoformat(),
        "uptime": "Service running normally"
    })

@app.route('/generate-path', methods=['POST'])
def generate_learning_path():
    """Generate comprehensive learning path with full functionality"""
    try:
        user_input = request.get_json()
        
        if not user_input:
            return jsonify({
                "success": False,
                "message": "No input data provided",
                "required_fields": ["title", "durationWeeks", "preferredDifficulty", "availableTimePerWeek"]
            }), 400
        
        # Validate required fields
        required_fields = ["title", "durationWeeks", "preferredDifficulty", "availableTimePerWeek"]
        missing_fields = [field for field in required_fields if field not in user_input]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
                "provided_fields": list(user_input.keys())
            }), 400
        
        print(f"Generating learning path for: {user_input.get('title')}")
        print(f"Input parameters: {user_input}")
        
        # Generate the comprehensive learning path
        result = path_generator.generate_path(user_input)
        
        if result["success"]:
            print(f"Learning path generated successfully! Path ID: {result['path_id']}")
            return jsonify(result), 200
        else:
            print(f"Generation failed: {result['error']}")
            return jsonify(result), 500
            
    except Exception as e:
        print(f"Error in generate_learning_path: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Internal server error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/domains', methods=['GET'])
def get_available_domains():
    """Get detailed information about available learning domains"""
    domain_info = {}
    
    for domain, difficulties in LEARNING_DATABASE.items():
        domain_info[domain] = {
            "name": domain.title(),
            "difficulties": list(difficulties.keys()),
            "total_topics": sum(len(diff_data.get('topics', [])) for diff_data in difficulties.values()),
            "sample_topics": difficulties.get('beginner', {}).get('topics', [])[:3] if 'beginner' in difficulties else []
        }
    
    return jsonify({
        "success": True,
        "domains": domain_info,
        "total_domains": len(LEARNING_DATABASE),
        "message": "Available learning domains retrieved successfully"
    })

@app.route('/validate-input', methods=['POST'])
def validate_user_input():
    """Validate user input and provide suggestions"""
    try:
        user_input = request.get_json()
        
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "suggestions": []
        }
        
        # Validate duration
        duration = user_input.get('durationWeeks', 0)
        if duration < 4:
            validation_result["warnings"].append("Duration less than 4 weeks may not provide comprehensive learning")
        elif duration > 52:
            validation_result["warnings"].append("Duration over 52 weeks is quite long - consider breaking into smaller paths")
        
        # Validate time commitment
        hours = user_input.get('availableTimePerWeek', 0)
        if hours < 5:
            validation_result["warnings"].append("Less than 5 hours per week may slow progress significantly")
        elif hours > 30:
            validation_result["warnings"].append("More than 30 hours per week may lead to burnout")
        
        # Analyze goal and provide domain suggestions
        analysis = path_generator.analyze_user_input(user_input)
        validation_result["suggested_domain"] = analysis['domain']
        validation_result["confidence"] = analysis['confidence']
        
        return jsonify({
            "success": True,
            "validation": validation_result,
            "message": "Input validation completed"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Validation failed",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting PathCrafter Advanced ML Service...")
    print("📚 Loaded learning domains:", list(LEARNING_DATABASE.keys()))
    print("🌐 Service available at: http://localhost:5001")
    print("💡 Endpoints:")
    print("   - GET  /health - Service health check")
    print("   - POST /generate-path - Generate learning path")
    print("   - GET  /domains - Available domains")
    print("   - POST /validate-input - Validate user input")
    app.run(debug=True, host='0.0.0.0', port=5001)
