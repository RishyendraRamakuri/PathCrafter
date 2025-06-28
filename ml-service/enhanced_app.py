from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import uuid
import os
from resource_fetcher import resource_fetcher, resource_cache
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['YOUTUBE_API_KEY'] = os.environ.get('YOUTUBE_API_KEY')
app.config['GITHUB_TOKEN'] = os.environ.get('GITHUB_TOKEN')

@app.route('/health')
def health():
    return {
        "status": "healthy",
        "youtube_key_configured": bool(app.config['YOUTUBE_API_KEY'])
    }
CORS(app)

# Enhanced Learning Content Database with ALL domains from frontend
LEARNING_DATABASE = {
    "web-development": {
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
                    "difficulty": "beginner",
                    "keywords": ["HTML", "HTML5", "Web Structure", "Semantic HTML"]
                },
                {
                    "name": "CSS Styling", 
                    "subtopics": ["Selectors", "Box Model", "Flexbox", "Grid", "Responsive Design"],
                    "estimated_hours": 12,
                    "difficulty": "beginner",
                    "keywords": ["CSS", "CSS3", "Flexbox", "Grid", "Responsive Design"]
                },
                {
                    "name": "JavaScript Basics",
                    "subtopics": ["Variables", "Functions", "DOM Manipulation", "Events", "ES6 Features"],
                    "estimated_hours": 16,
                    "difficulty": "beginner",
                    "keywords": ["JavaScript", "ES6", "DOM", "JavaScript Basics"]
                },
                {
                    "name": "Version Control",
                    "subtopics": ["Git Basics", "GitHub", "Branching", "Collaboration"],
                    "estimated_hours": 6,
                    "difficulty": "beginner",
                    "keywords": ["Git", "GitHub", "Version Control"]
                },
                {
                    "name": "Web Deployment",
                    "subtopics": ["Hosting Platforms", "Domain Setup", "FTP", "Static Site Deployment"],
                    "estimated_hours": 4,
                    "difficulty": "beginner",
                    "keywords": ["Web Deployment", "Hosting", "Netlify", "Vercel"]
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
                    "difficulty": "intermediate",
                    "keywords": ["React", "React Hooks", "Components", "JSX"]
                },
                {
                    "name": "Node.js & Express",
                    "subtopics": ["Server Setup", "Routing", "Middleware", "API Development", "Error Handling"],
                    "estimated_hours": 18,
                    "difficulty": "intermediate",
                    "keywords": ["Node.js", "Express", "API", "Backend"]
                },
                {
                    "name": "Database Integration",
                    "subtopics": ["MongoDB", "Mongoose", "CRUD Operations", "Data Modeling", "Relationships"],
                    "estimated_hours": 16,
                    "difficulty": "intermediate",
                    "keywords": ["MongoDB", "Database", "Mongoose", "NoSQL"]
                },
                {
                    "name": "Authentication & Security",
                    "subtopics": ["JWT Tokens", "Password Hashing", "Protected Routes", "User Sessions"],
                    "estimated_hours": 12,
                    "difficulty": "intermediate",
                    "keywords": ["Authentication", "JWT", "Security", "Auth"]
                },
                {
                    "name": "Full-Stack Integration",
                    "subtopics": ["API Integration", "State Management", "Error Handling", "Deployment"],
                    "estimated_hours": 14,
                    "difficulty": "intermediate",
                    "keywords": ["Full Stack", "MERN", "Integration", "Deployment"]
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
                    "difficulty": "advanced",
                    "keywords": ["Advanced React", "React Patterns", "Performance", "TypeScript"]
                },
                {
                    "name": "Microservices Architecture",
                    "subtopics": ["Service Design", "API Gateway", "Inter-service Communication", "Data Consistency"],
                    "estimated_hours": 30,
                    "difficulty": "advanced",
                    "keywords": ["Microservices", "Architecture", "Distributed Systems"]
                },
                {
                    "name": "DevOps & Deployment",
                    "subtopics": ["Docker", "CI/CD Pipelines", "Cloud Platforms", "Monitoring", "Scaling"],
                    "estimated_hours": 28,
                    "difficulty": "advanced",
                    "keywords": ["DevOps", "Docker", "CI/CD", "Cloud"]
                },
                {
                    "name": "Performance & Security",
                    "subtopics": ["Code Splitting", "Caching Strategies", "Security Best Practices", "Load Testing"],
                    "estimated_hours": 22,
                    "difficulty": "advanced",
                    "keywords": ["Performance", "Security", "Optimization", "Caching"]
                }
            ]
        }
    },
    "data-science": {
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
                    "difficulty": "beginner",
                    "keywords": ["Python", "Pandas", "NumPy", "Data Science Python"]
                },
                {
                    "name": "Data Visualization",
                    "subtopics": ["Matplotlib", "Seaborn", "Plotly", "Chart Types", "Dashboard Creation"],
                    "estimated_hours": 15,
                    "difficulty": "beginner",
                    "keywords": ["Data Visualization", "Matplotlib", "Seaborn", "Charts"]
                },
                {
                    "name": "Statistics & Probability",
                    "subtopics": ["Descriptive Statistics", "Probability Distributions", "Hypothesis Testing", "Correlation"],
                    "estimated_hours": 18,
                    "difficulty": "beginner",
                    "keywords": ["Statistics", "Probability", "Statistical Analysis"]
                },
                {
                    "name": "Data Cleaning & Preparation",
                    "subtopics": ["Missing Data", "Outliers", "Data Transformation", "Feature Engineering"],
                    "estimated_hours": 12,
                    "difficulty": "beginner",
                    "keywords": ["Data Cleaning", "Data Preparation", "Feature Engineering"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Python proficiency", "Basic statistics", "Data manipulation skills"],
            "learning_objectives": [
                "Build and evaluate machine learning models",
                "Implement advanced data analysis techniques",
                "Create interactive dashboards and visualizations",
                "Work with big data tools and frameworks",
                "Deploy machine learning models to production"
            ],
            "topics": [
                {
                    "name": "Machine Learning Fundamentals",
                    "subtopics": ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Cross-validation"],
                    "estimated_hours": 25,
                    "difficulty": "intermediate",
                    "keywords": ["Machine Learning", "Scikit-learn", "ML Models", "Supervised Learning"]
                },
                {
                    "name": "Advanced Analytics",
                    "subtopics": ["Time Series Analysis", "A/B Testing", "Cohort Analysis", "Statistical Modeling"],
                    "estimated_hours": 20,
                    "difficulty": "intermediate",
                    "keywords": ["Advanced Analytics", "Time Series", "A/B Testing", "Statistical Modeling"]
                },
                {
                    "name": "Big Data Tools",
                    "subtopics": ["Apache Spark", "Hadoop", "SQL Optimization", "Data Warehousing"],
                    "estimated_hours": 18,
                    "difficulty": "intermediate",
                    "keywords": ["Big Data", "Apache Spark", "Hadoop", "Data Warehousing"]
                },
                {
                    "name": "Model Deployment",
                    "subtopics": ["Flask APIs", "Docker Containers", "Cloud Deployment", "Model Monitoring"],
                    "estimated_hours": 15,
                    "difficulty": "intermediate",
                    "keywords": ["Model Deployment", "MLOps", "Flask", "Docker"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Machine learning experience", "Advanced Python", "Statistical knowledge"],
            "learning_objectives": [
                "Implement deep learning and neural networks",
                "Build end-to-end ML pipelines and MLOps systems",
                "Work with advanced AI techniques and frameworks",
                "Design and optimize large-scale data systems",
                "Lead data science projects and teams"
            ],
            "topics": [
                {
                    "name": "Deep Learning & Neural Networks",
                    "subtopics": ["TensorFlow", "PyTorch", "CNN", "RNN", "Transfer Learning"],
                    "estimated_hours": 30,
                    "difficulty": "advanced",
                    "keywords": ["Deep Learning", "Neural Networks", "TensorFlow", "PyTorch"]
                },
                {
                    "name": "MLOps & Production Systems",
                    "subtopics": ["ML Pipelines", "Model Versioning", "Continuous Integration", "Monitoring"],
                    "estimated_hours": 25,
                    "difficulty": "advanced",
                    "keywords": ["MLOps", "ML Pipelines", "Production ML", "Model Monitoring"]
                },
                {
                    "name": "Advanced AI Techniques",
                    "subtopics": ["NLP", "Computer Vision", "Reinforcement Learning", "GANs"],
                    "estimated_hours": 35,
                    "difficulty": "advanced",
                    "keywords": ["NLP", "Computer Vision", "Reinforcement Learning", "Advanced AI"]
                },
                {
                    "name": "Data Engineering at Scale",
                    "subtopics": ["Stream Processing", "Data Lakes", "Cloud Architecture", "Performance Optimization"],
                    "estimated_hours": 28,
                    "difficulty": "advanced",
                    "keywords": ["Data Engineering", "Stream Processing", "Data Lakes", "Cloud Architecture"]
                }
            ]
        }
    },
    "mobile-development": {
        "beginner": {
            "prerequisites": ["Basic programming knowledge", "Understanding of mobile platforms"],
            "learning_objectives": [
                "Build native mobile applications",
                "Understand mobile UI/UX principles",
                "Work with device features and APIs",
                "Deploy apps to app stores"
            ],
            "topics": [
                {
                    "name": "Mobile Development Fundamentals",
                    "subtopics": ["Platform Overview", "Development Environment", "Basic UI Components"],
                    "estimated_hours": 15,
                    "difficulty": "beginner",
                    "keywords": ["Mobile Development", "iOS", "Android", "App Development"]
                },
                {
                    "name": "UI/UX for Mobile",
                    "subtopics": ["Design Principles", "Navigation", "Responsive Design", "User Experience"],
                    "estimated_hours": 12,
                    "difficulty": "beginner",
                    "keywords": ["Mobile UI", "UX Design", "Mobile Design", "User Interface"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Basic mobile development", "Programming fundamentals"],
            "learning_objectives": [
                "Build complex mobile applications",
                "Integrate with backend services",
                "Implement advanced features",
                "Optimize app performance"
            ],
            "topics": [
                {
                    "name": "Advanced Mobile Features",
                    "subtopics": ["API Integration", "Local Storage", "Push Notifications", "Camera/GPS"],
                    "estimated_hours": 20,
                    "difficulty": "intermediate",
                    "keywords": ["Mobile APIs", "Push Notifications", "Mobile Features"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Mobile development experience", "Backend integration knowledge"],
            "learning_objectives": [
                "Architect scalable mobile applications",
                "Implement advanced performance optimization",
                "Lead mobile development teams",
                "Deploy enterprise-level mobile solutions"
            ],
            "topics": [
                {
                    "name": "Mobile Architecture",
                    "subtopics": ["Design Patterns", "Performance Optimization", "Security", "Testing"],
                    "estimated_hours": 25,
                    "difficulty": "advanced",
                    "keywords": ["Mobile Architecture", "Performance", "Mobile Security"]
                }
            ]
        }
    },
    "cloud-computing": {
        "beginner": {
            "prerequisites": ["Basic IT knowledge", "Understanding of web technologies"],
            "learning_objectives": [
                "Understand cloud computing fundamentals",
                "Deploy applications to cloud platforms",
                "Manage cloud resources",
                "Implement basic cloud security"
            ],
            "topics": [
                {
                    "name": "Cloud Fundamentals",
                    "subtopics": ["Cloud Models", "Service Types", "Major Providers", "Basic Deployment"],
                    "estimated_hours": 18,
                    "difficulty": "beginner",
                    "keywords": ["Cloud Computing", "AWS", "Azure", "Cloud Basics"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Cloud basics", "System administration knowledge"],
            "learning_objectives": [
                "Design cloud architectures",
                "Implement DevOps practices",
                "Manage cloud infrastructure",
                "Optimize cloud costs"
            ],
            "topics": [
                {
                    "name": "Cloud Architecture",
                    "subtopics": ["Infrastructure Design", "Scalability", "Load Balancing", "Monitoring"],
                    "estimated_hours": 22,
                    "difficulty": "intermediate",
                    "keywords": ["Cloud Architecture", "DevOps", "Infrastructure"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Cloud architecture experience", "DevOps knowledge"],
            "learning_objectives": [
                "Design enterprise cloud solutions",
                "Implement advanced security measures",
                "Lead cloud transformation projects",
                "Optimize complex cloud environments"
            ],
            "topics": [
                {
                    "name": "Enterprise Cloud Solutions",
                    "subtopics": ["Multi-cloud Strategy", "Advanced Security", "Compliance", "Cost Optimization"],
                    "estimated_hours": 30,
                    "difficulty": "advanced",
                    "keywords": ["Enterprise Cloud", "Multi-cloud", "Cloud Security"]
                }
            ]
        }
    },
    "cybersecurity": {
        "beginner": {
            "prerequisites": ["Basic IT knowledge", "Understanding of networks"],
            "learning_objectives": [
                "Understand cybersecurity fundamentals",
                "Identify common security threats",
                "Implement basic security measures",
                "Follow security best practices"
            ],
            "topics": [
                {
                    "name": "Security Fundamentals",
                    "subtopics": ["Threat Landscape", "Risk Assessment", "Security Controls", "Incident Response"],
                    "estimated_hours": 20,
                    "difficulty": "beginner",
                    "keywords": ["Cybersecurity", "Security Fundamentals", "Threat Analysis"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Security basics", "Network knowledge"],
            "learning_objectives": [
                "Conduct security assessments",
                "Implement advanced security controls",
                "Respond to security incidents",
                "Manage security tools"
            ],
            "topics": [
                {
                    "name": "Security Assessment",
                    "subtopics": ["Vulnerability Scanning", "Penetration Testing", "Security Auditing", "Compliance"],
                    "estimated_hours": 25,
                    "difficulty": "intermediate",
                    "keywords": ["Security Assessment", "Penetration Testing", "Vulnerability"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Security assessment experience", "Advanced technical knowledge"],
            "learning_objectives": [
                "Design enterprise security architectures",
                "Lead incident response teams",
                "Develop security strategies",
                "Manage security programs"
            ],
            "topics": [
                {
                    "name": "Enterprise Security",
                    "subtopics": ["Security Architecture", "Advanced Threats", "Security Management", "Compliance"],
                    "estimated_hours": 35,
                    "difficulty": "advanced",
                    "keywords": ["Enterprise Security", "Security Architecture", "Advanced Threats"]
                }
            ]
        }
    },
    "ui-ux-design": {
        "beginner": {
            "prerequisites": ["Basic design sense", "Computer literacy"],
            "learning_objectives": [
                "Understand design principles",
                "Create user-centered designs",
                "Use design tools effectively",
                "Conduct basic user research"
            ],
            "topics": [
                {
                    "name": "Design Fundamentals",
                    "subtopics": ["Design Principles", "Color Theory", "Typography", "Layout"],
                    "estimated_hours": 16,
                    "difficulty": "beginner",
                    "keywords": ["UI Design", "UX Design", "Design Principles", "User Interface"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Design basics", "Tool proficiency"],
            "learning_objectives": [
                "Create complex design systems",
                "Conduct user research",
                "Build interactive prototypes",
                "Collaborate with development teams"
            ],
            "topics": [
                {
                    "name": "Advanced Design",
                    "subtopics": ["Design Systems", "User Research", "Prototyping", "Usability Testing"],
                    "estimated_hours": 22,
                    "difficulty": "intermediate",
                    "keywords": ["Design Systems", "User Research", "Prototyping", "Usability"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Design experience", "User research knowledge"],
            "learning_objectives": [
                "Lead design teams",
                "Develop design strategies",
                "Create innovative user experiences",
                "Drive design thinking in organizations"
            ],
            "topics": [
                {
                    "name": "Design Leadership",
                    "subtopics": ["Design Strategy", "Team Leadership", "Innovation", "Design Thinking"],
                    "estimated_hours": 28,
                    "difficulty": "advanced",
                    "keywords": ["Design Leadership", "Design Strategy", "Design Thinking"]
                }
            ]
        }
    },
    "game-development": {
        "beginner": {
            "prerequisites": ["Basic programming knowledge", "Interest in games"],
            "learning_objectives": [
                "Understand game development fundamentals",
                "Create simple games",
                "Learn game engines",
                "Implement basic game mechanics"
            ],
            "topics": [
                {
                    "name": "Game Development Basics",
                    "subtopics": ["Game Engines", "Game Mechanics", "2D Graphics", "Basic Scripting"],
                    "estimated_hours": 18,
                    "difficulty": "beginner",
                    "keywords": ["Game Development", "Unity", "Game Design", "Game Programming"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Game development basics", "Programming skills"],
            "learning_objectives": [
                "Build complex games",
                "Implement advanced mechanics",
                "Work with 3D graphics",
                "Optimize game performance"
            ],
            "topics": [
                {
                    "name": "Advanced Game Development",
                    "subtopics": ["3D Graphics", "Physics", "AI", "Multiplayer"],
                    "estimated_hours": 25,
                    "difficulty": "intermediate",
                    "keywords": ["3D Game Development", "Game Physics", "Game AI"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Game development experience", "Advanced programming"],
            "learning_objectives": [
                "Architect game systems",
                "Lead game development teams",
                "Optimize for multiple platforms",
                "Publish commercial games"
            ],
            "topics": [
                {
                    "name": "Professional Game Development",
                    "subtopics": ["Game Architecture", "Platform Optimization", "Publishing", "Team Leadership"],
                    "estimated_hours": 32,
                    "difficulty": "advanced",
                    "keywords": ["Professional Game Development", "Game Architecture", "Game Publishing"]
                }
            ]
        }
    },
    "blockchain": {
        "beginner": {
            "prerequisites": ["Basic programming knowledge", "Understanding of cryptography"],
            "learning_objectives": [
                "Understand blockchain fundamentals",
                "Learn cryptocurrency basics",
                "Create simple smart contracts",
                "Understand decentralized applications"
            ],
            "topics": [
                {
                    "name": "Blockchain Fundamentals",
                    "subtopics": ["Blockchain Basics", "Cryptocurrencies", "Smart Contracts", "DApps"],
                    "estimated_hours": 20,
                    "difficulty": "beginner",
                    "keywords": ["Blockchain", "Cryptocurrency", "Smart Contracts", "DeFi"]
                }
            ]
        },
        "intermediate": {
            "prerequisites": ["Blockchain basics", "Programming experience"],
            "learning_objectives": [
                "Develop complex smart contracts",
                "Build decentralized applications",
                "Understand DeFi protocols",
                "Implement blockchain security"
            ],
            "topics": [
                {
                    "name": "Advanced Blockchain Development",
                    "subtopics": ["Complex Smart Contracts", "DeFi Development", "Security", "Testing"],
                    "estimated_hours": 26,
                    "difficulty": "intermediate",
                    "keywords": ["Advanced Blockchain", "DeFi Development", "Blockchain Security"]
                }
            ]
        },
        "advanced": {
            "prerequisites": ["Blockchain development experience", "Advanced programming"],
            "learning_objectives": [
                "Design blockchain architectures",
                "Lead blockchain projects",
                "Implement enterprise solutions",
                "Research new blockchain technologies"
            ],
            "topics": [
                {
                    "name": "Enterprise Blockchain",
                    "subtopics": ["Blockchain Architecture", "Enterprise Solutions", "Research", "Innovation"],
                    "estimated_hours": 30,
                    "difficulty": "advanced",
                    "keywords": ["Enterprise Blockchain", "Blockchain Architecture", "Blockchain Innovation"]
                }
            ]
        }
    }
}

class AdvancedLearningPathGenerator:
    def __init__(self):
        self.database = LEARNING_DATABASE
        self.resource_fetcher = resource_fetcher
        self.cache = resource_cache
    
    def analyze_user_input(self, user_input):
        """Enhanced analysis that handles frontend domain selection"""
        # Check if domain is explicitly provided (from frontend selection)
        explicit_domain = user_input.get('domain')
        explicit_subdomain = user_input.get('subdomain')
        
        if explicit_domain and explicit_domain in self.database:
            # Use explicit domain selection from frontend
            return {
                'domain': explicit_domain,
                'subdomain': explicit_subdomain or 'general',
                'confidence': 1.0,  # High confidence for explicit selection
                'scores': {explicit_domain: 10}  # High score for selected domain
            }
        
        # Fallback to keyword analysis for backward compatibility
        goal_title = user_input.get('title', '').lower()
        description = user_input.get('description', '').lower()
        goals = user_input.get('goals', [])
        preferred_topics = user_input.get('preferredTopics', [])
        
        # Combine all text for analysis
        combined_text = f"{goal_title} {description} {' '.join(goals)} {' '.join(preferred_topics)}".lower()
        
        # Enhanced domain detection with scoring
        domain_scores = {}
        
        # Define keywords for each domain
        domain_keywords = {
            'web-development': [
                'web', 'frontend', 'backend', 'fullstack', 'react', 'javascript', 'html', 'css', 
                'node', 'express', 'website', 'app', 'vue', 'angular', 'typescript', 'api'
            ],
            'data-science': [
                'data', 'analytics', 'machine learning', 'ai', 'pandas', 'python', 'statistics', 
                'visualization', 'analysis', 'ml', 'numpy', 'scikit', 'tensorflow', 'pytorch'
            ],
            'mobile-development': [
                'mobile', 'ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 
                'app development', 'mobile app', 'smartphone'
            ],
            'cloud-computing': [
                'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 
                'infrastructure', 'serverless', 'microservices'
            ],
            'cybersecurity': [
                'security', 'cybersecurity', 'hacking', 'penetration', 'vulnerability', 
                'encryption', 'firewall', 'malware', 'threat'
            ],
            'ui-ux-design': [
                'design', 'ui', 'ux', 'user interface', 'user experience', 'figma', 
                'sketch', 'prototype', 'wireframe'
            ],
            'game-development': [
                'game', 'gaming', 'unity', 'unreal', 'game development', 'game design', 
                'gamedev', 'indie game'
            ],
            'blockchain': [
                'blockchain', 'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'smart contract', 
                'defi', 'nft', 'web3'
            ]
        }
        
        # Calculate scores for each domain
        for domain, keywords in domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            domain_scores[domain] = score
        
        # Determine primary domain
        primary_domain = max(domain_scores, key=domain_scores.get) if max(domain_scores.values()) > 0 else 'web-development'
        
        # Determine subdomain based on specific keywords
        subdomain = self._determine_subdomain(primary_domain, combined_text, preferred_topics)
        
        return {
            'domain': primary_domain,
            'subdomain': subdomain,
            'confidence': max(domain_scores.values()) / len(combined_text.split()) if combined_text else 0.5,
            'scores': domain_scores
        }
    
    def _determine_subdomain(self, domain, combined_text, preferred_topics):
        """Determine the most appropriate subdomain"""
        subdomain_keywords = {
            'web-development': {
                'frontend': ['react', 'vue', 'angular', 'frontend', 'ui', 'css', 'html'],
                'backend': ['node', 'express', 'api', 'backend', 'server', 'database'],
                'fullstack': ['fullstack', 'full stack', 'mern', 'mean', 'end to end'],
                'devops': ['devops', 'docker', 'kubernetes', 'ci/cd', 'deployment']
            },
            'data-science': {
                'analytics': ['analytics', 'analysis', 'business intelligence', 'dashboard'],
                'machine-learning': ['machine learning', 'ml', 'model', 'prediction'],
                'ai': ['ai', 'artificial intelligence', 'deep learning', 'neural'],
                'data-engineering': ['data engineering', 'pipeline', 'etl', 'big data']
            },
            'mobile-development': {
                'ios': ['ios', 'swift', 'iphone', 'ipad'],
                'android': ['android', 'kotlin', 'java'],
                'react-native': ['react native', 'react-native'],
                'flutter': ['flutter', 'dart']
            },
            'cloud-computing': {
                'aws': ['aws', 'amazon web services'],
                'azure': ['azure', 'microsoft'],
                'gcp': ['gcp', 'google cloud'],
                'cloud-devops': ['devops', 'ci/cd', 'deployment']
            }
        }
        
        if domain not in subdomain_keywords:
            return 'general'
        
        subdomain_scores = {}
        for subdomain, keywords in subdomain_keywords[domain].items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            # Also check preferred topics
            score += sum(1 for topic in preferred_topics if any(keyword in topic.lower() for keyword in keywords))
            subdomain_scores[subdomain] = score
        
        return max(subdomain_scores, key=subdomain_scores.get) if max(subdomain_scores.values()) > 0 else list(subdomain_keywords[domain].keys())[0]
    
    def generate_detailed_weekly_plan(self, domain, subdomain, difficulty, duration_weeks, hours_per_week, user_goals):
        """Generate comprehensive weekly learning plan with real resources"""
        if domain not in self.database or difficulty not in self.database[domain]:
            # Fallback to available domain/difficulty
            domain = 'web-development' if domain not in self.database else domain
            difficulty = 'beginner' if difficulty not in self.database[domain] else difficulty
        
        content = self.database[domain][difficulty]
        topics = content['topics']
        
        weekly_plan = []
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
                
                # Get real resources for this topic
                topic_resources = self.get_topic_resources(domain, subdomain, topic, difficulty)
                
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
                    "resources_needed": topic_resources,
                    "assessment": self.generate_weekly_assessment(topic, week_in_topic),
                    "completed": False,
                    "completed_at": None
                })
                
                current_week += 1
            
            current_topic_index += 1
        
        return weekly_plan
    
    def get_topic_resources(self, domain, subdomain, topic, difficulty):
        """Get real resources for a specific topic"""
        try:
            # Create cache key
            cache_key = f"{domain}_{subdomain}_{topic['name']}_{difficulty}"
            
            # Check cache first
            cached_resources = self.cache.get(cache_key)
            if cached_resources:
                logger.info(f"Using cached resources for {cache_key}")
                return cached_resources
            
            # Get keywords for this topic
            keywords = topic.get('keywords', [topic['name']])
            
            # Fetch resources using the resource fetcher
            resources = []
            
            # Get videos (limit to 3 for weekly plan)
            videos = self.resource_fetcher.get_youtube_videos(keywords, difficulty, 3)
            resources.extend(videos)
            
            # Get projects (limit to 2)
            projects = self.resource_fetcher.get_github_projects(keywords, difficulty, 2)
            resources.extend(projects)
            
            # Get articles (limit to 2)
            articles = self.resource_fetcher.get_dev_articles(keywords, 2)
            resources.extend(articles)
            
            # Cache the results
            self.cache.set(cache_key, resources)
            
            logger.info(f"Fetched {len(resources)} resources for topic: {topic['name']}")
            return resources
            
        except Exception as e:
            logger.error(f"Error fetching topic resources: {str(e)}")
            return [{
                "title": f"Learn {topic['name']}",
                "url": "#",
                "description": f"Resources for learning {topic['name']}",
                "type": "fallback",
                "free": True,
                "difficulty": difficulty
            }]
    
    def generate_comprehensive_resources(self, domain, subdomain, difficulty):
        """Get comprehensive resource list with real APIs"""
        try:
            # Create cache key
            cache_key = f"comprehensive_{domain}_{subdomain}_{difficulty}"
            
            # Check cache first
            cached_resources = self.cache.get(cache_key)
            if cached_resources:
                logger.info(f"Using cached comprehensive resources for {cache_key}")
                return cached_resources
            
            # Fetch comprehensive resources
            resources = self.resource_fetcher.get_comprehensive_resources(domain, subdomain, difficulty)
            
            # Cache the results
            self.cache.set(cache_key, resources)
            
            logger.info(f"Generated comprehensive resources for {domain}/{subdomain}")
            return resources
            
        except Exception as e:
            logger.error(f"Error generating comprehensive resources: {str(e)}")
            return {
                "videos": [],
                "projects": [],
                "articles": [],
                "courses": [],
                "documentation": [],
                "practice": []
            }
    
    def generate_weekly_activities(self, topic, week_in_topic, total_weeks, phase):
        """Generate specific activities for each week"""
        if phase == "Foundation Building":
            return [
                f"Study {topic['name']} fundamentals through video tutorials",
                f"Read documentation and articles about {', '.join(topic['subtopics'][:2])}",
                "Complete hands-on coding exercises and examples",
                "Take detailed notes and create concept summaries",
                "Join online communities and ask questions"
            ]
        elif phase == "Skill Development":
            return [
                f"Build practice projects using {topic['name']}",
                "Solve coding challenges and real-world problems",
                "Review and analyze example projects from GitHub",
                "Experiment with different approaches and techniques",
                "Document your learning progress and code examples"
            ]
        else:  # Mastery & Integration
            return [
                f"Implement advanced {topic['name']} features in projects",
                "Optimize and refactor previous work for best practices",
                "Contribute to open-source projects or help others",
                "Create tutorial content or teach concepts you've learned",
                "Prepare portfolio pieces and case studies"
            ]
    
    def generate_weekly_deliverables(self, topic, week_in_topic, total_weeks):
        """Generate specific deliverables for each week"""
        return [
            f"Completed exercises and examples for {topic['name']}",
            f"Summary notes covering {', '.join(topic['subtopics'][:2])}",
            "Working code samples demonstrating key concepts",
            "Weekly reflection document with progress and challenges",
            "Updated learning portfolio with new skills"
        ]
    
    def generate_weekly_objectives(self, topic, week_in_topic):
        """Generate specific learning objectives for each week"""
        return [
            f"Master the fundamental concepts of {topic['name']}",
            f"Successfully implement {topic['subtopics'][0] if topic['subtopics'] else topic['name']} in practice",
            "Build confidence through hands-on coding and projects",
            "Identify areas for improvement and plan next steps"
        ]
    
    def generate_weekly_assessment(self, topic, week_in_topic):
        """Generate assessment criteria for each week"""
        return {
            "self_assessment_questions": [
                f"Can I explain the key concepts of {topic['name']} clearly?",
                f"Am I comfortable implementing {topic['subtopics'][0] if topic['subtopics'] else topic['name']}?",
                "What challenges did I face this week and how did I overcome them?",
                "What would I like to explore further or improve?"
            ],
            "practical_checkpoints": [
                "Complete all assigned exercises and tutorials",
                "Successfully implement code examples without assistance",
                "Explain concepts to someone else or in writing",
                "Apply learning to a small personal project"
            ],
            "knowledge_check": [
                f"Quiz yourself on {topic['name']} terminology and concepts",
                "Review and understand error messages and debugging",
                "Compare different approaches and explain trade-offs",
                "Connect this week's learning to previous topics"
            ]
        }
    
    def generate_comprehensive_milestones(self, weekly_plan, domain, subdomain, difficulty):
        """Generate detailed milestones with specific criteria"""
        total_weeks = len(weekly_plan)
        milestones = []
        
        # Calculate milestone weeks (more granular for longer paths)
        if total_weeks <= 8:
            milestone_points = [
                (total_weeks // 2, "Mid-Point Milestone"),
                (total_weeks, "Completion Milestone")
            ]
        elif total_weeks <= 16:
            milestone_points = [
                (total_weeks // 4, "Foundation Milestone"),
                (total_weeks // 2, "Development Milestone"),
                ((3 * total_weeks) // 4, "Integration Milestone"),
                (total_weeks, "Mastery Milestone")
            ]
        else:
            milestone_points = [
                (total_weeks // 6, "Getting Started Milestone"),
                (total_weeks // 3, "Foundation Milestone"),
                (total_weeks // 2, "Development Milestone"),
                ((2 * total_weeks) // 3, "Integration Milestone"),
                ((5 * total_weeks) // 6, "Advanced Milestone"),
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
                    "description": f"Complete weeks 1-{week} of your {domain} {subdomain} learning journey",
                    "target_week": week,
                    "completion_criteria": [
                        f"Master {len(topics_covered)} core topics: {', '.join(topics_covered[:3])}{'...' if len(topics_covered) > 3 else ''}",
                        f"Complete {total_hours} hours of structured learning",
                        "Pass all weekly self-assessments with 80%+ confidence",
                        "Build and deploy at least one functional project",
                        "Demonstrate skills through code examples and documentation"
                    ],
                    "skills_acquired": topics_covered,
                    "estimated_hours": total_hours,
                    "reward": f"Digital certificate for {title}",
                    "next_steps": f"Advance to more complex {domain} topics and projects",
                    "completed": False,
                    "completion_date": None,
                    "progress_percentage": (week / total_weeks) * 100
                }
                milestones.append(milestone)
        
        return milestones
    
    def calculate_learning_metrics(self, weekly_plan, duration_weeks, hours_per_week, domain, subdomain):
        """Calculate comprehensive learning metrics"""
        total_hours = duration_weeks * hours_per_week
        total_topics = len(set([w.get('primary_topic', '') for w in weekly_plan]))
        
        # Calculate difficulty distribution
        difficulty_distribution = {}
        for week in weekly_plan:
            diff = week.get('difficulty_level', 'beginner')
            difficulty_distribution[diff] = difficulty_distribution.get(diff, 0) + 1
        
        # Calculate phase distribution
        phase_distribution = {}
        for week in weekly_plan:
            phase = week.get('phase', 'Unknown')
            phase_distribution[phase] = phase_distribution.get(phase, 0) + 1
        
        return {
            "total_learning_hours": total_hours,
            "total_topics_covered": total_topics,
            "average_hours_per_topic": round(total_hours / total_topics, 1) if total_topics > 0 else 0,
            "difficulty_distribution": difficulty_distribution,
            "phase_distribution": phase_distribution,
            "estimated_completion_rate": 0.85,  # Based on typical completion rates
            "recommended_study_schedule": f"{hours_per_week} hours per week over {duration_weeks} weeks",
            "domain": domain,
            "subdomain": subdomain,
            "total_resources_provided": sum(len(week.get('resources_needed', [])) for week in weekly_plan),
            "learning_intensity": "High" if hours_per_week > 15 else "Medium" if hours_per_week > 8 else "Low"
        }
    
    def generate_path(self, user_input):
        """Generate a comprehensive, production-ready learning path with real resources"""
        try:
            # Extract and validate user input - FLEXIBLE INPUT HANDLING
            title = user_input.get('title', '')
            description = user_input.get('description', '')
            goals = user_input.get('goals', [])
            duration_weeks = int(user_input.get('durationWeeks', 12))
            difficulty = user_input.get('preferredDifficulty', 'beginner').lower()
            hours_per_week = int(user_input.get('availableTimePerWeek', 10))
            preferred_topics = user_input.get('preferredTopics', [])
            
            # NEW: Handle explicit domain/subdomain from frontend
            explicit_domain = user_input.get('domain')
            explicit_subdomain = user_input.get('subdomain')
            
            # Analyze user input to determine optimal path
            analysis = self.analyze_user_input(user_input)
            domain = explicit_domain or analysis['domain']
            subdomain = explicit_subdomain or analysis['subdomain']
            
            logger.info(f"Generating path for domain: {domain}, subdomain: {subdomain}, difficulty: {difficulty}")
            logger.info(f"Explicit domain selection: {explicit_domain}, Explicit subdomain: {explicit_subdomain}")
            
            # Validate domain and difficulty
            if domain not in self.database:
                domain = 'web-development'  # fallback
            if difficulty not in self.database[domain]:
                difficulty = 'beginner'  # fallback
            
            # Get domain-specific content
            domain_content = self.database[domain][difficulty]
            
            # Generate comprehensive components
            weekly_plan = self.generate_detailed_weekly_plan(domain, subdomain, difficulty, duration_weeks, hours_per_week, goals)
            milestones = self.generate_comprehensive_milestones(weekly_plan, domain, subdomain, difficulty)
            resources = self.generate_comprehensive_resources(domain, subdomain, difficulty)
            learning_metrics = self.calculate_learning_metrics(weekly_plan, duration_weeks, hours_per_week, domain, subdomain)
            
            # Calculate dates
            start_date = datetime.now()
            completion_date = start_date + timedelta(weeks=duration_weeks)
            
            # Create comprehensive learning path
            learning_path = {
                "id": str(uuid.uuid4()),
                "title": title,
                "description": description,
                "overview": f"This comprehensive {duration_weeks}-week {difficulty}-level learning path in {domain} "
                           f"({subdomain}) is designed to help you achieve: {title}. You'll invest {hours_per_week} hours per week "
                           f"in structured learning, hands-on projects, and skill development with real-world resources.",
                
                # Core path information
                "domain": domain,
                "subdomain": subdomain,
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
                "version": "2.0",
                "generated_by": "PathCrafter Enhanced ML Service",
                "confidence_score": analysis['confidence'],
                "analysis_details": analysis
            }
            
            logger.info(f"Successfully generated learning path: {learning_path['id']}")
            
            return {
                "success": True,
                "learning_path": learning_path,
                "message": f"Comprehensive {domain} ({subdomain}) learning path generated successfully with real resources!",
                "generation_time": datetime.now().isoformat(),
                "path_id": learning_path["id"],
                "resource_count": {
                    "videos": len(resources.get("videos", [])),
                    "projects": len(resources.get("projects", [])),
                    "articles": len(resources.get("articles", [])),
                    "courses": len(resources.get("courses", [])),
                    "total": sum(len(r) for r in resources.values())
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating learning path: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate comprehensive learning path",
                "timestamp": datetime.now().isoformat()
            }

# Initialize the enhanced generator
path_generator = AdvancedLearningPathGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check with service information"""
    return jsonify({
        "status": "healthy",
        "service": "PathCrafter Enhanced ML Service with Real Resources",
        "version": "2.0.0",
        "capabilities": [
            "Comprehensive learning path generation",
            "Real-time resource fetching from YouTube, GitHub, Dev.to",
            "Multi-domain support with 8+ domains",
            "Detailed weekly planning with activities and deliverables",
            "Progress tracking and milestone management",
            "Smart caching system for optimal performance",
            "Fallback systems for reliability",
            "Frontend domain selection support"
        ],
        "supported_domains": list(LEARNING_DATABASE.keys()),
        "supported_difficulties": ["beginner", "intermediate", "advanced"],
        "api_integrations": {
            "youtube": bool(os.getenv('YOUTUBE_API_KEY')),
            "github": bool(os.getenv('GITHUB_TOKEN')),
            "dev_to": True,
            "caching": True
        },
        "timestamp": datetime.now().isoformat(),
        "uptime": "Service running with enhanced capabilities"
    })

@app.route('/generate-path', methods=['POST'])
def generate_learning_path():
    """Generate comprehensive learning path with real resources - FLEXIBLE INPUT HANDLING"""
    try:
        user_input = request.get_json()
        
        if not user_input:
            return jsonify({
                "success": False,
                "message": "No input data provided",
                "required_fields": ["title", "durationWeeks", "preferredDifficulty", "availableTimePerWeek"]
            }), 400
        
        # FLEXIBLE validation - only check essential fields
        essential_fields = ["title", "durationWeeks", "preferredDifficulty", "availableTimePerWeek"]
        missing_fields = [field for field in essential_fields if field not in user_input or user_input[field] == ""]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "message": f"Missing required fields: {', '.join(missing_fields)}",
                "provided_fields": list(user_input.keys()),
                "required_fields": essential_fields
            }), 400
        
        logger.info(f"Generating learning path for: {user_input.get('title')}")
        logger.info(f"Input parameters: {user_input}")
        
        # Generate the comprehensive learning path
        result = path_generator.generate_path(user_input)
        
        if result["success"]:
            logger.info(f"Learning path generated successfully! Path ID: {result['path_id']}")
            logger.info(f"Resources fetched: {result['resource_count']}")
            return jsonify(result), 200
        else:
            logger.error(f"Generation failed: {result['error']}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"Error in generate_learning_path: {str(e)}")
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
    
    for domain in LEARNING_DATABASE.keys():
        difficulties = list(LEARNING_DATABASE.get(domain, {}).keys())
        
        domain_info[domain] = {
            "name": domain.replace("-", " ").title(),
            "difficulties": difficulties,
            "total_topics": sum(len(diff_data.get('topics', [])) for diff_data in LEARNING_DATABASE.get(domain, {}).values()),
            "sample_topics": LEARNING_DATABASE.get(domain, {}).get('beginner', {}).get('topics', [])[:3],
            "has_real_resources": True  # All domains now have resource support
        }
    
    return jsonify({
        "success": True,
        "domains": domain_info,
        "total_domains": len(domain_info),
        "message": "Available learning domains retrieved successfully",
        "resource_integration": {
            "youtube_enabled": bool(os.getenv('YOUTUBE_API_KEY')),
            "github_enabled": bool(os.getenv('GITHUB_TOKEN')),
            "dev_to_enabled": True,
            "total_supported_domains": len(LEARNING_DATABASE)
        }
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
            validation_result["suggestions"].append("Consider extending to at least 6-8 weeks for better results")
        elif duration > 52:
            validation_result["warnings"].append("Duration over 52 weeks is quite long - consider breaking into smaller paths")
            validation_result["suggestions"].append("Break into 2-3 shorter paths of 16-20 weeks each")
        
        # Validate time commitment
        hours = user_input.get('availableTimePerWeek', 0)
        if hours < 5:
            validation_result["warnings"].append("Less than 5 hours per week may slow progress significantly")
            validation_result["suggestions"].append("Try to allocate at least 7-10 hours per week for meaningful progress")
        elif hours > 30:
            validation_result["warnings"].append("More than 30 hours per week may lead to burnout")
            validation_result["suggestions"].append("Consider 15-20 hours per week for sustainable learning")
        
        # Analyze goal and provide domain suggestions
        analysis = path_generator.analyze_user_input(user_input)
        validation_result["suggested_domain"] = analysis['domain']
        validation_result["suggested_subdomain"] = analysis['subdomain']
        validation_result["confidence"] = analysis['confidence']
        validation_result["domain_scores"] = analysis['scores']
        
        # Provide specific suggestions based on analysis
        if analysis['confidence'] < 0.3:
            validation_result["suggestions"].append("Consider providing more specific details about your learning goals")
            validation_result["suggestions"].append("Add preferred technologies or topics to get better recommendations")
        
        return jsonify({
            "success": True,
            "validation": validation_result,
            "message": "Input validation completed with enhanced analysis"
        })
        
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Validation failed",
            "error": str(e)
        }), 500

@app.route('/resources/preview', methods=['POST'])
def preview_resources():
    """Preview resources for a given domain/subdomain combination"""
    try:
        data = request.get_json()
        domain = data.get('domain', 'web-development')
        subdomain = data.get('subdomain', 'frontend')
        difficulty = data.get('difficulty', 'beginner')
        
        # Get a small preview of resources
        cache_key = f"preview_{domain}_{subdomain}_{difficulty}"
        cached_preview = resource_cache.get(cache_key)
        
        if cached_preview:
            return jsonify({
                "success": True,
                "preview": cached_preview,
                "cached": True
            })
        
        # Fetch fresh preview
        resources = resource_fetcher.get_comprehensive_resources(domain, subdomain, difficulty)
        
        # Create preview (limit items)
        preview = {
            "videos": resources.get("videos", [])[:3],
            "projects": resources.get("projects", [])[:2],
            "articles": resources.get("articles", [])[:2],
            "courses": resources.get("courses", [])[:2]
        }
        
        # Cache preview
        resource_cache.set(cache_key, preview)
        
        return jsonify({
            "success": True,
            "preview": preview,
            "total_available": {
                "videos": len(resources.get("videos", [])),
                "projects": len(resources.get("projects", [])),
                "articles": len(resources.get("articles", [])),
                "courses": len(resources.get("courses", []))
            },
            "cached": False
        })
        
    except Exception as e:
        logger.error(f"Resource preview error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to generate resource preview",
            "error": str(e)
        }), 500

@app.route('/cache/stats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    return jsonify({
        "success": True,
        "cache_stats": {
            "total_cached_items": len(resource_cache.cache),
            "cache_duration_hours": resource_cache.cache_duration.total_seconds() / 3600,
            "cached_keys": list(resource_cache.cache.keys())
        },
        "message": "Cache statistics retrieved successfully"
    })

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear the resource cache"""
    try:
        resource_cache.clear()
        return jsonify({
            "success": True,
            "message": "Cache cleared successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to clear cache",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting PathCrafter Enhanced ML Service with Real Resources...")
    print("📚 Loaded learning domains:", list(LEARNING_DATABASE.keys()))
    print("🔗 Resource integrations:")
    print(f"   - YouTube API: {'✅ Enabled' if os.getenv('YOUTUBE_API_KEY') else '❌ Disabled (set YOUTUBE_API_KEY)'}")
    print(f"   - GitHub API: {'✅ Enabled' if os.getenv('GITHUB_TOKEN') else '❌ Disabled (set GITHUB_TOKEN)'}")
    print("   - Dev.to API: ✅ Enabled")
    print("🌐 Service available at: http://localhost:5001")
    print("💡 Enhanced Endpoints:")
    print("   - GET  /health - Service health check with API status")
    print("   - POST /generate-path - Generate learning path with real resources")
    print("   - GET  /domains - Available domains with resource info")
    print("   - POST /validate-input - Enhanced input validation")
    print("   - POST /resources/preview - Preview resources for domain/subdomain")
    print("   - GET  /cache/stats - Cache statistics")
    print("   - POST /cache/clear - Clear resource cache")
    app.run(debug=True, host='0.0.0.0', port=5001)
