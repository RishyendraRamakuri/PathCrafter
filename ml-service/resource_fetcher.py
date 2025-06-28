import requests
import json
import time
from datetime import datetime, timedelta
import os
from typing import Dict, List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UniversalResourceFetcher:
    def __init__(self):
        # API Keys from environment variables
        self.youtube_api_key = os.getenv('YOUTUBE_API_KEY')
        self.github_token = os.getenv('GITHUB_TOKEN')
        
        # Rate limiting
        self.last_youtube_call = 0
        self.last_github_call = 0
        self.youtube_delay = 1  # seconds between calls
        self.github_delay = 0.5
        
        # Domain-specific keywords and search terms
        self.domain_keywords = {
            "web-development": {
                "frontend": {
                    "primary": ["React", "Vue.js", "Angular", "JavaScript", "TypeScript", "CSS", "HTML"],
                    "secondary": ["Frontend Development", "Web Design", "Responsive Design", "CSS Grid", "Flexbox"],
                    "technologies": ["React", "Vue", "Angular", "JavaScript", "TypeScript", "Sass", "Tailwind CSS"],
                    "projects": ["Portfolio Website", "E-commerce Frontend", "Dashboard", "Landing Page"]
                },
                "backend": {
                    "primary": ["Node.js", "Express", "Python", "Django", "Flask", "API Development"],
                    "secondary": ["Backend Development", "REST API", "GraphQL", "Database Design"],
                    "technologies": ["Node.js", "Express", "Python", "Django", "Flask", "MongoDB", "PostgreSQL"],
                    "projects": ["REST API", "Authentication System", "Database Design", "Microservices"]
                },
                "fullstack": {
                    "primary": ["Full Stack", "MERN", "MEAN", "Django React", "Next.js"],
                    "secondary": ["Full Stack Development", "Web Application", "End-to-end Development"],
                    "technologies": ["React", "Node.js", "MongoDB", "Express", "Next.js", "PostgreSQL"],
                    "projects": ["Social Media App", "E-commerce Platform", "SaaS Application", "Blog Platform"]
                },
                "devops": {
                    "primary": ["Docker", "Kubernetes", "CI/CD", "AWS", "DevOps"],
                    "secondary": ["Container Orchestration", "Cloud Deployment", "Infrastructure"],
                    "technologies": ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform", "Ansible"],
                    "projects": ["CI/CD Pipeline", "Container Deployment", "Infrastructure as Code"]
                }
            },
            "data-science": {
                "analytics": {
                    "primary": ["Data Analysis", "Python Pandas", "SQL", "Data Visualization", "Tableau"],
                    "secondary": ["Business Intelligence", "Data Mining", "Statistical Analysis"],
                    "technologies": ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "SQL", "Tableau"],
                    "projects": ["Sales Analysis", "Customer Segmentation", "Business Dashboard", "A/B Testing"]
                },
                "machine-learning": {
                    "primary": ["Machine Learning", "Scikit-learn", "TensorFlow", "PyTorch", "ML"],
                    "secondary": ["Predictive Modeling", "Classification", "Regression", "Clustering"],
                    "technologies": ["Python", "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "XGBoost"],
                    "projects": ["Prediction Model", "Recommendation System", "Image Classification", "NLP Project"]
                },
                "ai": {
                    "primary": ["Artificial Intelligence", "Deep Learning", "Neural Networks", "NLP"],
                    "secondary": ["Computer Vision", "Natural Language Processing", "AI Development"],
                    "technologies": ["TensorFlow", "PyTorch", "Keras", "OpenCV", "NLTK", "spaCy"],
                    "projects": ["Chatbot", "Image Recognition", "Sentiment Analysis", "Computer Vision App"]
                },
                "data-engineering": {
                    "primary": ["Data Engineering", "Apache Spark", "Airflow", "ETL", "Data Pipeline"],
                    "secondary": ["Big Data", "Data Warehousing", "Stream Processing"],
                    "technologies": ["Apache Spark", "Airflow", "Kafka", "Snowflake", "dbt", "AWS Glue"],
                    "projects": ["Data Pipeline", "ETL System", "Real-time Processing", "Data Warehouse"]
                }
            },
            "mobile-development": {
                "ios": {
                    "primary": ["iOS Development", "Swift", "SwiftUI", "Xcode", "iPhone App"],
                    "secondary": ["iOS Programming", "Apple Development", "Mobile App iOS"],
                    "technologies": ["Swift", "SwiftUI", "UIKit", "Core Data", "Xcode", "iOS SDK"],
                    "projects": ["iOS App", "iPhone Application", "SwiftUI Project", "iOS Game"]
                },
                "android": {
                    "primary": ["Android Development", "Kotlin", "Java Android", "Android Studio"],
                    "secondary": ["Android Programming", "Mobile App Android", "Google Play"],
                    "technologies": ["Kotlin", "Java", "Android Studio", "Jetpack Compose", "Firebase"],
                    "projects": ["Android App", "Kotlin Project", "Android Game", "Material Design App"]
                },
                "react-native": {
                    "primary": ["React Native", "Cross Platform", "Mobile Development React"],
                    "secondary": ["React Native Development", "Expo", "Mobile App Development"],
                    "technologies": ["React Native", "Expo", "Redux", "React Navigation", "Firebase"],
                    "projects": ["Cross Platform App", "React Native Project", "Mobile App", "Expo App"]
                },
                "flutter": {
                    "primary": ["Flutter", "Dart", "Cross Platform Flutter", "Google Flutter"],
                    "secondary": ["Flutter Development", "Dart Programming", "Mobile Flutter"],
                    "technologies": ["Flutter", "Dart", "Firebase", "Provider", "Bloc", "GetX"],
                    "projects": ["Flutter App", "Dart Project", "Cross Platform Flutter", "Mobile Flutter App"]
                }
            },
            "cloud-computing": {
                "aws": {
                    "primary": ["AWS", "Amazon Web Services", "Cloud Computing AWS", "EC2", "S3"],
                    "secondary": ["AWS Certification", "Cloud Architecture", "AWS Services"],
                    "technologies": ["EC2", "S3", "Lambda", "RDS", "CloudFormation", "EKS"],
                    "projects": ["AWS Project", "Cloud Architecture", "Serverless Application", "AWS Infrastructure"]
                },
                "azure": {
                    "primary": ["Microsoft Azure", "Azure Cloud", "Azure Services", "Azure DevOps"],
                    "secondary": ["Azure Certification", "Cloud Computing Azure", "Microsoft Cloud"],
                    "technologies": ["Azure VMs", "Azure Functions", "Azure SQL", "Azure DevOps", "ARM Templates"],
                    "projects": ["Azure Project", "Cloud Migration", "Azure Architecture", "DevOps Pipeline"]
                },
                "gcp": {
                    "primary": ["Google Cloud", "GCP", "Google Cloud Platform", "Cloud Computing Google"],
                    "secondary": ["GCP Certification", "Google Cloud Services", "Cloud Architecture"],
                    "technologies": ["Compute Engine", "Cloud Functions", "BigQuery", "Kubernetes Engine"],
                    "projects": ["GCP Project", "Google Cloud Architecture", "Data Pipeline GCP", "ML on GCP"]
                },
                "cloud-devops": {
                    "primary": ["Cloud DevOps", "Infrastructure as Code", "Cloud Automation", "Terraform"],
                    "secondary": ["Cloud CI/CD", "Infrastructure Management", "Cloud Security"],
                    "technologies": ["Terraform", "Ansible", "Jenkins", "GitLab CI", "Docker", "Kubernetes"],
                    "projects": ["Infrastructure as Code", "CI/CD Pipeline", "Cloud Automation", "DevOps Project"]
                }
            },
            "cybersecurity": {
                "ethical-hacking": {
                    "primary": ["Ethical Hacking", "Penetration Testing", "Cybersecurity", "Security Testing"],
                    "secondary": ["White Hat Hacking", "Security Assessment", "Vulnerability Testing"],
                    "technologies": ["Kali Linux", "Metasploit", "Nmap", "Burp Suite", "Wireshark"],
                    "projects": ["Penetration Test", "Security Assessment", "Vulnerability Scan", "Ethical Hack"]
                },
                "security-analysis": {
                    "primary": ["Security Analysis", "Threat Analysis", "Security Monitoring", "SIEM"],
                    "secondary": ["Cybersecurity Analysis", "Security Operations", "Incident Response"],
                    "technologies": ["Splunk", "ELK Stack", "Wireshark", "Nessus", "OpenVAS"],
                    "projects": ["Security Dashboard", "Threat Detection", "Log Analysis", "Security Monitoring"]
                },
                "compliance": {
                    "primary": ["Security Compliance", "Governance", "Risk Management", "Audit"],
                    "secondary": ["Compliance Framework", "Security Policy", "Risk Assessment"],
                    "technologies": ["GRC Tools", "Compliance Software", "Risk Assessment Tools"],
                    "projects": ["Compliance Framework", "Risk Assessment", "Security Policy", "Audit System"]
                },
                "incident-response": {
                    "primary": ["Incident Response", "Digital Forensics", "Security Incident", "Forensic Analysis"],
                    "secondary": ["Cyber Incident", "Security Investigation", "Malware Analysis"],
                    "technologies": ["Volatility", "Autopsy", "YARA", "Sleuth Kit", "FTK"],
                    "projects": ["Incident Response Plan", "Forensic Investigation", "Malware Analysis", "Security Playbook"]
                }
            },
            "ui-ux-design": {
                "ui-design": {
                    "primary": ["UI Design", "User Interface", "Design Systems", "Figma", "Adobe XD"],
                    "secondary": ["Interface Design", "Visual Design", "Design Principles"],
                    "technologies": ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
                    "projects": ["UI Design Project", "Design System", "Mobile UI", "Web Interface"]
                },
                "ux-research": {
                    "primary": ["UX Research", "User Experience", "User Testing", "Usability"],
                    "secondary": ["User Research", "UX Methods", "Design Research"],
                    "technologies": ["Miro", "UserTesting", "Hotjar", "Google Analytics", "Maze"],
                    "projects": ["UX Research Study", "User Testing", "Usability Analysis", "User Journey Map"]
                },
                "design-systems": {
                    "primary": ["Design Systems", "Component Library", "Design Tokens", "Style Guide"],
                    "secondary": ["Design Standards", "UI Components", "Design Documentation"],
                    "technologies": ["Figma", "Storybook", "Zeplin", "Abstract", "InVision"],
                    "projects": ["Design System", "Component Library", "Style Guide", "Design Documentation"]
                },
                "prototyping": {
                    "primary": ["Prototyping", "Interactive Design", "Design Prototype", "Wireframing"],
                    "secondary": ["Design Process", "User Flow", "Information Architecture"],
                    "technologies": ["Figma", "Principle", "Framer", "InVision", "Marvel"],
                    "projects": ["Interactive Prototype", "Wireframe", "User Flow", "Design Mockup"]
                }
            },
            "game-development": {
                "unity": {
                    "primary": ["Unity", "Unity 3D", "Game Development Unity", "C# Unity"],
                    "secondary": ["Unity Engine", "3D Game Development", "Unity Programming"],
                    "technologies": ["Unity", "C#", "Visual Studio", "Blender", "Unity Analytics"],
                    "projects": ["Unity Game", "3D Game", "Mobile Game Unity", "VR Game"]
                },
                "unreal": {
                    "primary": ["Unreal Engine", "UE4", "UE5", "Game Development Unreal"],
                    "secondary": ["Unreal Development", "Blueprint", "C++ Unreal"],
                    "technologies": ["Unreal Engine", "Blueprint", "C++", "Maya", "3ds Max"],
                    "projects": ["Unreal Game", "AAA Game", "VR Experience", "Architectural Visualization"]
                },
                "mobile-games": {
                    "primary": ["Mobile Game Development", "Android Game", "iOS Game", "Mobile Gaming"],
                    "secondary": ["Game Development Mobile", "Casual Games", "Hyper Casual"],
                    "technologies": ["Unity", "Unreal", "Cocos2d", "GameMaker", "Construct"],
                    "projects": ["Mobile Game", "Casual Game", "Puzzle Game", "Arcade Game"]
                },
                "indie-games": {
                    "primary": ["Indie Game Development", "Independent Games", "Solo Game Dev"],
                    "secondary": ["Indie Gaming", "Game Development Indie", "Small Team Games"],
                    "technologies": ["Unity", "Godot", "GameMaker", "Construct", "Defold"],
                    "projects": ["Indie Game", "2D Platformer", "Puzzle Game", "Story Game"]
                }
            },
            "blockchain": {
                "smart-contracts": {
                    "primary": ["Smart Contracts", "Solidity", "Ethereum", "Blockchain Development"],
                    "secondary": ["DApp Development", "Smart Contract Programming", "Ethereum Development"],
                    "technologies": ["Solidity", "Web3.js", "Truffle", "Hardhat", "MetaMask"],
                    "projects": ["Smart Contract", "DApp", "Token Contract", "NFT Contract"]
                },
                "defi": {
                    "primary": ["DeFi", "Decentralized Finance", "DeFi Development", "Yield Farming"],
                    "secondary": ["DeFi Protocol", "Liquidity Mining", "Automated Market Maker"],
                    "technologies": ["Solidity", "Uniswap", "Compound", "Aave", "OpenZeppelin"],
                    "projects": ["DeFi Protocol", "DEX", "Lending Platform", "Yield Farm"]
                },
                "nft": {
                    "primary": ["NFT", "Non-Fungible Tokens", "NFT Development", "Digital Collectibles"],
                    "secondary": ["NFT Marketplace", "Digital Art", "Collectibles"],
                    "technologies": ["Solidity", "IPFS", "OpenSea", "Pinata", "Moralis"],
                    "projects": ["NFT Collection", "NFT Marketplace", "Digital Art Platform", "Gaming NFTs"]
                },
                "web3": {
                    "primary": ["Web3", "Decentralized Web", "Web3 Development", "Blockchain Web"],
                    "secondary": ["DApp Frontend", "Web3 Integration", "Decentralized Applications"],
                    "technologies": ["Web3.js", "Ethers.js", "React", "IPFS", "MetaMask"],
                    "projects": ["Web3 App", "DApp Frontend", "Decentralized Platform", "Blockchain Integration"]
                }
            }
        }
        
        # Curated high-quality free resources as fallback
        self.curated_resources = {
            "web-development": {
                "courses": [
                    {
                        "title": "The Odin Project",
                        "url": "https://www.theodinproject.com/",
                        "type": "interactive_course",
                        "description": "Full stack curriculum with projects",
                        "free": True,
                        "difficulty": "beginner"
                    },
                    {
                        "title": "FreeCodeCamp",
                        "url": "https://www.freecodecamp.org/",
                        "type": "interactive_course", 
                        "description": "Comprehensive web development curriculum",
                        "free": True,
                        "difficulty": "beginner"
                    }
                ],
                "documentation": [
                    {
                        "title": "MDN Web Docs",
                        "url": "https://developer.mozilla.org/",
                        "type": "documentation",
                        "description": "Comprehensive web technology documentation",
                        "free": True
                    }
                ]
            },
            "data-science": {
                "courses": [
                    {
                        "title": "Kaggle Learn",
                        "url": "https://www.kaggle.com/learn",
                        "type": "interactive_course",
                        "description": "Free micro-courses in data science",
                        "free": True,
                        "difficulty": "beginner"
                    }
                ]
            }
        }

    def _rate_limit_youtube(self):
        """Ensure we don't exceed YouTube API rate limits"""
        current_time = time.time()
        if current_time - self.last_youtube_call < self.youtube_delay:
            time.sleep(self.youtube_delay - (current_time - self.last_youtube_call))
        self.last_youtube_call = time.time()

    def _rate_limit_github(self):
        """Ensure we don't exceed GitHub API rate limits"""
        current_time = time.time()
        if current_time - self.last_github_call < self.github_delay:
            time.sleep(self.github_delay - (current_time - self.last_github_call))
        self.last_github_call = time.time()

    def get_youtube_videos(self, keywords: List[str], difficulty: str = "beginner", max_results: int = 5) -> List[Dict]:
        """Fetch educational videos from YouTube API"""
        if not self.youtube_api_key:
            logger.warning("YouTube API key not found, using fallback")
            return self._get_fallback_videos(keywords, difficulty)
        
        try:
            self._rate_limit_youtube()
            
            # Create search query
            search_terms = " ".join(keywords[:3])  # Use first 3 keywords
            if difficulty == "beginner":
                search_terms += " tutorial beginner"
            elif difficulty == "intermediate":
                search_terms += " course intermediate"
            else:
                search_terms += " advanced masterclass"
            
            # YouTube API request
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": search_terms,
                "type": "video",
                "videoDuration": "medium",  # 4-20 minutes
                "videoDefinition": "high",
                "order": "relevance",
                "maxResults": max_results,
                "key": self.youtube_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            videos = []
            
            for item in data.get("items", []):
                video = {
                    "title": item["snippet"]["title"],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    "description": item["snippet"]["description"][:200] + "...",
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                    "channel": item["snippet"]["channelTitle"],
                    "type": "video",
                    "platform": "YouTube",
                    "free": True,
                    "estimated_time": "10-20 minutes",
                    "difficulty": difficulty
                }
                videos.append(video)
            
            logger.info(f"Fetched {len(videos)} YouTube videos for: {search_terms}")
            return videos
            
        except Exception as e:
            logger.error(f"YouTube API error: {str(e)}")
            return self._get_fallback_videos(keywords, difficulty)

    def get_github_projects(self, keywords: List[str], difficulty: str = "beginner", max_results: int = 5) -> List[Dict]:
        """Fetch relevant GitHub repositories"""
        if not self.github_token:
            logger.warning("GitHub token not found, using fallback")
            return self._get_fallback_projects(keywords, difficulty)
        
        try:
            self._rate_limit_github()
            
            # Create search query
            search_terms = " ".join(keywords[:2])
            if difficulty == "beginner":
                search_terms += " tutorial example starter"
            elif difficulty == "intermediate":
                search_terms += " project example"
            else:
                search_terms += " advanced framework library"
            
            # GitHub API request
            url = "https://api.github.com/search/repositories"
            headers = {
                "Authorization": f"token {self.github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            params = {
                "q": search_terms,
                "sort": "stars",
                "order": "desc",
                "per_page": max_results
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            projects = []
            
            for item in data.get("items", []):
                project = {
                    "title": item["name"],
                    "url": item["html_url"],
                    "description": item["description"] or "No description available",
                    "stars": item["stargazers_count"],
                    "language": item["language"],
                    "type": "project",
                    "platform": "GitHub",
                    "free": True,
                    "difficulty": difficulty,
                    "last_updated": item["updated_at"]
                }
                projects.append(project)
            
            logger.info(f"Fetched {len(projects)} GitHub projects for: {search_terms}")
            return projects
            
        except Exception as e:
            logger.error(f"GitHub API error: {str(e)}")
            return self._get_fallback_projects(keywords, difficulty)

    def get_dev_articles(self, keywords: List[str], max_results: int = 5) -> List[Dict]:
        """Fetch articles from Dev.to"""
        try:
            search_terms = " ".join(keywords[:2])
            
            url = "https://dev.to/api/articles"
            params = {
                "tag": keywords[0].lower().replace(" ", "").replace(".", ""),
                "per_page": max_results,
                "top": "7"  # Top articles from last 7 days
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            articles = []
            
            for item in data:
                article = {
                    "title": item["title"],
                    "url": item["url"],
                    "description": item["description"] or item["title"],
                    "author": item["user"]["name"],
                    "reading_time": f"{item.get('reading_time_minutes', 5)} min read",
                    "tags": item["tag_list"],
                    "type": "article",
                    "platform": "Dev.to",
                    "free": True,
                    "published_at": item["published_at"]
                }
                articles.append(article)
            
            logger.info(f"Fetched {len(articles)} Dev.to articles for: {search_terms}")
            return articles
            
        except Exception as e:
            logger.error(f"Dev.to API error: {str(e)}")
            return self._get_fallback_articles(keywords)

    def get_comprehensive_resources(self, domain: str, subdomain: str, difficulty: str) -> Dict:
        """Get comprehensive resources for a specific domain and subdomain"""
        try:
            # Get keywords for this domain/subdomain
            domain_data = self.domain_keywords.get(domain, {})
            subdomain_data = domain_data.get(subdomain, {})
            
            if not subdomain_data:
                logger.warning(f"No keywords found for {domain}/{subdomain}")
                return self._get_fallback_comprehensive_resources(domain, difficulty)
            
            # Extract keywords
            primary_keywords = subdomain_data.get("primary", [])
            secondary_keywords = subdomain_data.get("secondary", [])
            technologies = subdomain_data.get("technologies", [])
            
            # Fetch resources from different sources
            resources = {
                "videos": [],
                "projects": [],
                "articles": [],
                "courses": [],
                "documentation": [],
                "practice": []
            }
            
            # Get videos (YouTube)
            video_keywords = primary_keywords[:3]
            resources["videos"] = self.get_youtube_videos(video_keywords, difficulty, 8)
            
            # Get projects (GitHub)
            project_keywords = technologies[:2] if technologies else primary_keywords[:2]
            resources["projects"] = self.get_github_projects(project_keywords, difficulty, 6)
            
            # Get articles (Dev.to)
            article_keywords = primary_keywords[:2]
            resources["articles"] = self.get_dev_articles(article_keywords, 6)
            
            # Add curated courses and documentation
            curated = self.curated_resources.get(domain, {})
            resources["courses"] = curated.get("courses", [])
            resources["documentation"] = curated.get("documentation", [])
            
            # Add practice resources
            resources["practice"] = self._get_practice_resources(domain, subdomain, technologies)
            
            # Filter by difficulty and add metadata
            resources = self._filter_and_enhance_resources(resources, difficulty, domain, subdomain)
            
            logger.info(f"Generated comprehensive resources for {domain}/{subdomain} ({difficulty})")
            return resources
            
        except Exception as e:
            logger.error(f"Error generating comprehensive resources: {str(e)}")
            return self._get_fallback_comprehensive_resources(domain, difficulty)

    def _get_practice_resources(self, domain: str, subdomain: str, technologies: List[str]) -> List[Dict]:
        """Get practice platforms and coding challenges"""
        practice_resources = []
        
        if domain == "web-development":
            practice_resources.extend([
                {
                    "title": "CodePen",
                    "url": "https://codepen.io/",
                    "description": "Online code editor for frontend development",
                    "type": "practice",
                    "platform": "CodePen",
                    "free": True
                },
                {
                    "title": "JSFiddle",
                    "url": "https://jsfiddle.net/",
                    "description": "Test and share JavaScript, CSS, HTML code",
                    "type": "practice", 
                    "platform": "JSFiddle",
                    "free": True
                }
            ])
        
        elif domain == "data-science":
            practice_resources.extend([
                {
                    "title": "Kaggle Competitions",
                    "url": "https://www.kaggle.com/competitions",
                    "description": "Data science competitions and datasets",
                    "type": "practice",
                    "platform": "Kaggle",
                    "free": True
                },
                {
                    "title": "Google Colab",
                    "url": "https://colab.research.google.com/",
                    "description": "Free Jupyter notebook environment",
                    "type": "practice",
                    "platform": "Google",
                    "free": True
                }
            ])
        
        # Add more domain-specific practice resources
        return practice_resources

    def _filter_and_enhance_resources(self, resources: Dict, difficulty: str, domain: str, subdomain: str) -> Dict:
        """Filter resources by difficulty and add metadata"""
        enhanced_resources = {}
        
        for category, items in resources.items():
            enhanced_items = []
            for item in items:
                # Add difficulty if not present
                if "difficulty" not in item:
                    item["difficulty"] = difficulty
                
                # Add domain/subdomain metadata
                item["domain"] = domain
                item["subdomain"] = subdomain
                item["fetched_at"] = datetime.now().isoformat()
                
                enhanced_items.append(item)
            
            enhanced_resources[category] = enhanced_items
        
        return enhanced_resources

    def _get_fallback_videos(self, keywords: List[str], difficulty: str) -> List[Dict]:
        """Fallback videos when API fails"""
        return [
            {
                "title": f"{keywords[0]} Tutorial for {difficulty.title()}",
                "url": "https://www.youtube.com/",
                "description": f"Learn {keywords[0]} from scratch",
                "type": "video",
                "platform": "YouTube",
                "free": True,
                "difficulty": difficulty,
                "fallback": True
            }
        ]

    def _get_fallback_projects(self, keywords: List[str], difficulty: str) -> List[Dict]:
        """Fallback projects when API fails"""
        return [
            {
                "title": f"{keywords[0]} Example Project",
                "url": "https://github.com/",
                "description": f"Example {keywords[0]} project for learning",
                "type": "project",
                "platform": "GitHub", 
                "free": True,
                "difficulty": difficulty,
                "fallback": True
            }
        ]

    def _get_fallback_articles(self, keywords: List[str]) -> List[Dict]:
        """Fallback articles when API fails"""
        return [
            {
                "title": f"Getting Started with {keywords[0]}",
                "url": "https://dev.to/",
                "description": f"Comprehensive guide to {keywords[0]}",
                "type": "article",
                "platform": "Dev.to",
                "free": True,
                "fallback": True
            }
        ]

    def _get_fallback_comprehensive_resources(self, domain: str, difficulty: str) -> Dict:
        """Comprehensive fallback when all APIs fail"""
        return {
            "videos": self._get_fallback_videos([domain], difficulty),
            "projects": self._get_fallback_projects([domain], difficulty),
            "articles": self._get_fallback_articles([domain]),
            "courses": self.curated_resources.get(domain, {}).get("courses", []),
            "documentation": self.curated_resources.get(domain, {}).get("documentation", []),
            "practice": []
        }

# Cache system for resources
class ResourceCache:
    def __init__(self, cache_duration_hours: int = 24):
        self.cache = {}
        self.cache_duration = timedelta(hours=cache_duration_hours)
    
    def get(self, key: str) -> Optional[Dict]:
        """Get cached resources if still valid"""
        if key in self.cache:
            cached_data, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_data
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, data: Dict):
        """Cache resources with timestamp"""
        self.cache[key] = (data, datetime.now())
    
    def clear(self):
        """Clear all cached data"""
        self.cache.clear()

# Global instances
resource_fetcher = UniversalResourceFetcher()
resource_cache = ResourceCache()
