-- Seed 50 domains with slugs
INSERT INTO domains (name, slug, description, icon) VALUES
('Medicine', 'medicine', 'Clinical medicine, diagnostics, treatment protocols', '🏥'),
('Computer Science', 'computer-science', 'Algorithms, data structures, systems design', '💻'),
('Engineering', 'engineering', 'Mechanical, civil, electrical, chemical engineering', '⚙️'),
('Law', 'law', 'Legal principles, case law, regulations', '⚖️'),
('Finance', 'finance', 'Markets, banking, investment, accounting', '💰'),
('Physics', 'physics', 'Classical mechanics, quantum, relativity, thermodynamics', '⚛️'),
('Chemistry', 'chemistry', 'Organic, inorganic, physical, analytical chemistry', '🧪'),
('Biology', 'biology', 'Molecular biology, genetics, ecology, evolution', '🧬'),
('Mathematics', 'mathematics', 'Pure and applied mathematics', '📐'),
('Psychology', 'psychology', 'Clinical, cognitive, developmental, social psychology', '🧠'),
('History', 'history', 'World history, civilizations, major events', '📜'),
('Philosophy', 'philosophy', 'Ethics, logic, metaphysics, epistemology', '🤔'),
('Business', 'business', 'Management, strategy, operations, entrepreneurship', '📊'),
('Agriculture', 'agriculture', 'Crop science, animal husbandry, soil science', '🌾'),
('Architecture', 'architecture', 'Building design, urban planning, structural systems', '🏛️'),
('Linguistics', 'linguistics', 'Phonetics, syntax, semantics, language families', '🗣️'),
('Art & Design', 'art-design', 'Visual arts, graphic design, art history', '🎨'),
('Music', 'music', 'Theory, composition, instruments, music history', '🎵'),
('Culinary', 'culinary', 'Cooking techniques, food science, cuisine styles', '👨‍🍳'),
('Education', 'education', 'Pedagogy, curriculum design, learning theory', '📚'),
('Environmental Science', 'environmental-science', 'Ecology, climate, conservation, sustainability', '🌍'),
('Astronomy', 'astronomy', 'Stars, galaxies, cosmology, planetary science', '🔭'),
('Geography', 'geography', 'Physical and human geography, cartography', '🗺️'),
('Sociology', 'sociology', 'Social structures, institutions, culture', '👥'),
('Political Science', 'political-science', 'Government, policy, international relations', '🏛️'),
('Sports Science', 'sports-science', 'Exercise physiology, biomechanics, nutrition', '🏃'),
('Military Science', 'military-science', 'Strategy, tactics, military history, logistics', '🎖️'),
('Maritime', 'maritime', 'Navigation, naval architecture, oceanography', '⚓'),
('Aviation', 'aviation', 'Aeronautics, flight operations, aircraft systems', '✈️'),
('Robotics', 'robotics', 'Mechatronics, control systems, automation', '🤖'),
('AI & Machine Learning', 'ai-ml', 'Neural networks, NLP, computer vision, reinforcement learning', '🧠'),
('Cybersecurity', 'cybersecurity', 'Network security, cryptography, threat analysis', '🔒'),
('Data Science', 'data-science', 'Statistics, visualization, big data, analytics', '📈'),
('Blockchain', 'blockchain', 'Distributed ledgers, smart contracts, DeFi', '⛓️'),
('Telecommunications', 'telecommunications', 'Networks, protocols, wireless, signal processing', '📡'),
('Manufacturing', 'manufacturing', 'Production systems, quality control, lean methods', '🏭'),
('Energy', 'energy', 'Renewable energy, power systems, nuclear, petroleum', '⚡'),
('Transportation', 'transportation', 'Logistics, traffic systems, vehicle engineering', '🚄'),
('Real Estate', 'real-estate', 'Property law, valuation, development, investment', '🏠'),
('Healthcare', 'healthcare', 'Public health, health systems, epidemiology', '🏥'),
('Veterinary', 'veterinary', 'Animal medicine, surgery, pathology', '🐾'),
('Pharmacy', 'pharmacy', 'Pharmacology, drug interactions, compounding', '💊'),
('Dentistry', 'dentistry', 'Oral health, dental procedures, orthodontics', '🦷'),
('Nursing', 'nursing', 'Patient care, clinical procedures, specialties', '👩‍⚕️'),
('Social Work', 'social-work', 'Case management, community services, advocacy', '🤝'),
('Journalism', 'journalism', 'Reporting, ethics, media law, investigative methods', '📰'),
('Film & Media', 'film-media', 'Cinematography, editing, production, media theory', '🎬'),
('Fashion', 'fashion', 'Design, textiles, trend analysis, merchandising', '👗'),
('Hospitality', 'hospitality', 'Hotel management, tourism, event planning', '🏨'),
('Quantum Computing', 'quantum-computing', 'Qubits, quantum gates, algorithms, error correction', '⚛️')
ON CONFLICT (slug) DO NOTHING;

-- Seed subdomains (10 per top domain, 500+ total)
-- Medicine subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'medicine'), 'Cardiology', 'cardiology', 'Heart and cardiovascular system'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Neurology', 'neurology', 'Nervous system disorders'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Oncology', 'oncology', 'Cancer diagnosis and treatment'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Pediatrics', 'pediatrics', 'Child and adolescent medicine'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Surgery', 'surgery', 'Surgical procedures and techniques'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Dermatology', 'dermatology', 'Skin conditions and treatment'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Radiology', 'radiology', 'Medical imaging and diagnosis'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Emergency Medicine', 'emergency-medicine', 'Acute care and trauma'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Psychiatry', 'psychiatry', 'Mental health disorders'),
((SELECT id FROM domains WHERE slug = 'medicine'), 'Orthopedics', 'orthopedics', 'Musculoskeletal system');

-- Computer Science subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Algorithms', 'algorithms', 'Algorithm design and analysis'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Data Structures', 'data-structures', 'Fundamental data organization'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Operating Systems', 'operating-systems', 'OS concepts and design'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Databases', 'databases', 'Database systems and SQL'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Networks', 'networks', 'Computer networking and protocols'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Compilers', 'compilers', 'Language processing and compilation'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Graphics', 'graphics', 'Computer graphics and rendering'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Distributed Systems', 'distributed-systems', 'Distributed computing patterns'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Software Engineering', 'software-engineering', 'Development practices and patterns'),
((SELECT id FROM domains WHERE slug = 'computer-science'), 'Theory of Computation', 'theory-of-computation', 'Automata, complexity, computability');

-- AI & ML subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Neural Networks', 'neural-networks', 'Deep learning architectures'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Natural Language Processing', 'nlp', 'Text and language understanding'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Computer Vision', 'computer-vision', 'Image and video analysis'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Reinforcement Learning', 'reinforcement-learning', 'Agent-based learning systems'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Generative AI', 'generative-ai', 'Content generation models'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'MLOps', 'mlops', 'ML engineering and deployment'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Ethics in AI', 'ethics-in-ai', 'Fairness, bias, and responsible AI'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Robotics AI', 'robotics-ai', 'AI for robotic systems'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Recommendation Systems', 'recommendation-systems', 'Collaborative and content filtering'),
((SELECT id FROM domains WHERE slug = 'ai-ml'), 'Time Series', 'time-series', 'Sequential data analysis');

-- Physics subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'physics'), 'Classical Mechanics', 'classical-mechanics', 'Newtonian physics and motion'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Quantum Mechanics', 'quantum-mechanics', 'Subatomic particle behavior'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Thermodynamics', 'thermodynamics', 'Heat, energy, and entropy'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Electromagnetism', 'electromagnetism', 'Electric and magnetic fields'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Optics', 'optics', 'Light and wave phenomena'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Nuclear Physics', 'nuclear-physics', 'Atomic nuclei and reactions'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Particle Physics', 'particle-physics', 'Fundamental particles and forces'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Astrophysics', 'astrophysics', 'Physics of celestial objects'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Fluid Dynamics', 'fluid-dynamics', 'Behavior of fluids in motion'),
((SELECT id FROM domains WHERE slug = 'physics'), 'Condensed Matter', 'condensed-matter', 'Solid and liquid state physics');

-- Finance subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'finance'), 'Investment Banking', 'investment-banking', 'Capital markets and M&A'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Portfolio Management', 'portfolio-management', 'Asset allocation and risk'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Derivatives', 'derivatives', 'Options, futures, swaps'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Corporate Finance', 'corporate-finance', 'Capital structure and valuation'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Financial Modeling', 'financial-modeling', 'Quantitative analysis and forecasting'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Accounting', 'accounting', 'Financial reporting and auditing'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Cryptocurrency', 'cryptocurrency', 'Digital assets and DeFi'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Risk Management', 'risk-management', 'Market, credit, operational risk'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Tax', 'tax', 'Tax law and planning'),
((SELECT id FROM domains WHERE slug = 'finance'), 'Insurance', 'insurance', 'Actuarial science and underwriting');

-- Law subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'law'), 'Constitutional Law', 'constitutional-law', 'Government powers and civil liberties'),
((SELECT id FROM domains WHERE slug = 'law'), 'Criminal Law', 'criminal-law', 'Crimes, defenses, and procedures'),
((SELECT id FROM domains WHERE slug = 'law'), 'Contract Law', 'contract-law', 'Agreement formation and enforcement'),
((SELECT id FROM domains WHERE slug = 'law'), 'Intellectual Property', 'intellectual-property', 'Patents, trademarks, copyright'),
((SELECT id FROM domains WHERE slug = 'law'), 'International Law', 'international-law', 'Treaties and cross-border regulation'),
((SELECT id FROM domains WHERE slug = 'law'), 'Environmental Law', 'environmental-law', 'Regulations and compliance'),
((SELECT id FROM domains WHERE slug = 'law'), 'Corporate Law', 'corporate-law', 'Business entities and governance'),
((SELECT id FROM domains WHERE slug = 'law'), 'Family Law', 'family-law', 'Marriage, custody, and divorce'),
((SELECT id FROM domains WHERE slug = 'law'), 'Labor Law', 'labor-law', 'Employment rights and regulations'),
((SELECT id FROM domains WHERE slug = 'law'), 'Tax Law', 'tax-law', 'Tax codes and compliance');

-- Biology subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'biology'), 'Molecular Biology', 'molecular-biology', 'DNA, RNA, protein synthesis'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Genetics', 'genetics', 'Heredity and gene expression'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Ecology', 'ecology', 'Ecosystems and biodiversity'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Microbiology', 'microbiology', 'Bacteria, viruses, fungi'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Cell Biology', 'cell-biology', 'Cell structure and function'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Evolution', 'evolution', 'Natural selection and speciation'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Immunology', 'immunology', 'Immune system function'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Neuroscience', 'neuroscience', 'Brain and nervous system'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Botany', 'botany', 'Plant biology and physiology'),
((SELECT id FROM domains WHERE slug = 'biology'), 'Marine Biology', 'marine-biology', 'Ocean life and ecosystems');

-- Cybersecurity subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Network Security', 'network-security', 'Firewall, IDS, network defense'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Cryptography', 'cryptography', 'Encryption algorithms and protocols'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Penetration Testing', 'penetration-testing', 'Offensive security and red teaming'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Malware Analysis', 'malware-analysis', 'Reverse engineering threats'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Cloud Security', 'cloud-security', 'AWS, Azure, GCP security'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Forensics', 'forensics', 'Digital evidence and investigation'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Application Security', 'application-security', 'OWASP and secure coding'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Identity & Access', 'identity-access', 'IAM, OAuth, SSO'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Compliance', 'compliance', 'SOC 2, HIPAA, GDPR, PCI'),
((SELECT id FROM domains WHERE slug = 'cybersecurity'), 'Incident Response', 'incident-response', 'Breach detection and recovery');

-- Engineering subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'engineering'), 'Mechanical Engineering', 'mechanical-engineering', 'Machines, mechanisms, materials'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Electrical Engineering', 'electrical-engineering', 'Circuits, power systems, electronics'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Civil Engineering', 'civil-engineering', 'Structures, transportation, water'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Chemical Engineering', 'chemical-engineering', 'Process design and reactions'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Aerospace Engineering', 'aerospace-engineering', 'Aircraft and spacecraft design'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Biomedical Engineering', 'biomedical-engineering', 'Medical devices and biomechanics'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Materials Science', 'materials-science', 'Material properties and selection'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Environmental Engineering', 'environmental-engineering', 'Waste, water, air treatment'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Industrial Engineering', 'industrial-engineering', 'Optimization and systems'),
((SELECT id FROM domains WHERE slug = 'engineering'), 'Nuclear Engineering', 'nuclear-engineering', 'Reactor design and radiation');

-- Mathematics subdomains
INSERT INTO subdomains (domain_id, name, slug, description) VALUES
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Linear Algebra', 'linear-algebra', 'Vectors, matrices, transformations'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Calculus', 'calculus', 'Derivatives, integrals, series'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Statistics', 'statistics', 'Probability and statistical inference'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Number Theory', 'number-theory', 'Properties of integers'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Topology', 'topology', 'Spatial properties and continuity'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Graph Theory', 'graph-theory', 'Networks, trees, combinatorics'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Differential Equations', 'differential-equations', 'ODEs and PDEs'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Abstract Algebra', 'abstract-algebra', 'Groups, rings, fields'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Discrete Math', 'discrete-math', 'Logic, sets, combinatorics'),
((SELECT id FROM domains WHERE slug = 'mathematics'), 'Optimization', 'optimization', 'Linear and nonlinear programming');
