import { PrismaClient, UserRole, OpportunityType, OpportunityFormat, Level, EmploymentType, OpportunityStatus, VerificationStatus, PrivacyLevel, ApplicationStatus, ContactStatus, ModerationStatus, ReportStatus, ReportReason, AuditAction, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// Passwords for demo accounts
const PASSWORDS = {
  admin: 'Admin123!',
  curator: 'Curator123!',
  employer: 'Employer123!',
  applicant: 'Applicant123!',
};

// Cities with coordinates for map
const CITIES = [
  { name: 'Москва', lat: 55.7558, lng: 37.6173 },
  { name: 'Санкт-Петербург', lat: 59.9311, lng: 30.3609 },
  { name: 'Новосибирск', lat: 55.0084, lng: 82.9357 },
  { name: 'Екатеринбург', lat: 56.8389, lng: 60.6057 },
  { name: 'Казань', lat: 55.8304, lng: 49.0661 },
  { name: 'Нижний Новгород', lat: 56.3269, lng: 44.0059 },
  { name: 'Челябинск', lat: 55.1644, lng: 61.4368 },
  { name: 'Самара', lat: 53.1959, lng: 50.1002 },
  { name: 'Омск', lat: 54.9885, lng: 73.3242 },
  { name: 'Ростов-на-Дону', lat: 47.2225, lng: 39.7182 },
];

// Tags organized by category
const TAGS = {
  technologies: [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 
    'Kotlin', 'PHP', 'Swift', 'Dart', 'SQL', 'HTML/CSS', 'Bash', 'R'
  ],
  frameworks: [
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'NestJS', 'Spring', 
    'Django', 'Flask', 'FastAPI', 'ASP.NET', 'Laravel', 'Flutter', 'TensorFlow', 
    'PyTorch', 'Pandas'
  ],
  db_infra: [
    'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'Elasticsearch', 'ClickHouse', 
    'Docker', 'Git', 'Linux', 'CI/CD', 'Kubernetes', 'AWS', 'GCP', 'Azure', 
    'Terraform', 'Nginx'
  ],
  directions: [
    'Frontend', 'Backend', 'Fullstack', 'Mobile', 'Data Science', 'Machine Learning', 
    'AI/LLM', 'DevOps', 'QA', 'GameDev', 'Embedded', 'Security', 'Business Analysis', 
    'Product Analytics', 'UI/UX'
  ],
};

const UNIVERSITIES = [
  'МГУ имени М.В. Ломоносова',
  'СПбГУ',
  'МФТИ',
  'ВШЭ',
  'ИТМО',
  'МГТУ им. Баумана',
  'СПбПУ',
  'НГУ',
  'УрФУ',
  'КФУ',
  'МИФИ',
  'МИСиС',
  'Сколково',
  'Иннополис',
];

const FACULTIES = [
  'Прикладная математика и информатика',
  'Программная инженерия',
  'Информационная безопасность',
  'Информационные системы',
  'Компьютерные науки',
  'Искусственный интеллект',
  'Дизайн и программирование',
  'Экономика и IT',
];

// Generate unique company names
const generateCompanyName = (index: number) => `Организация ${index}`;

const OPPORTUNITY_TITLES = {
  internship: [
    'Стажер-разработчик',
    'Стажер Data Science',
    'Стажер DevOps',
    'Стажер QA',
    'Стажер Frontend',
    'Стажер Backend',
    'Стажер Mobile',
    'Стажер ML Engineer',
    'Стажер Security',
    'Стажер Product Manager',
  ],
  vacancy: [
    'Junior Frontend Developer',
    'Junior Backend Developer',
    'Middle Frontend Developer',
    'Middle Backend Developer',
    'DevOps Engineer',
    'Data Analyst',
    'ML Engineer',
    'QA Engineer',
    'Mobile Developer',
    'Security Specialist',
    'Fullstack Developer',
    'Product Analyst',
  ],
  mentoring_program: [
    'Менторство по Frontend',
    'Менторство по Backend',
    'Менторство по Data Science',
    'Менторство по DevOps',
    'Менторство по Mobile',
    'Карьерное менторство',
    'Менторство по ML',
    'Менторство по QA',
  ],
  career_event: [
    'День открытых дверей',
    'Хакатон',
    'Карьерная ярмарка',
    'Митап по Frontend',
    'Митап по Backend',
    'ML Workshop',
    'DevOps Meetup',
    'Tech Talk',
    'Coding Interview Workshop',
  ],
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.contactRecommendation.deleteMany(),
    prisma.professionalContact.deleteMany(),
    prisma.applicationStatusHistory.deleteMany(),
    prisma.application.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.opportunityTag.deleteMany(),
    prisma.applicantSkillTag.deleteMany(),
    prisma.mediaFile.deleteMany(),
    prisma.opportunity.deleteMany(),
    prisma.employerVerification.deleteMany(),
    prisma.company.deleteMany(),
    prisma.project.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.applicantProfile.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.moderationQueueItem.deleteMany(),
    prisma.report.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.curatorInvite.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create tags
  console.log('🏷️ Creating tags...');
  const createdTags: Record<string, string> = {};
  
  for (const [category, tags] of Object.entries(TAGS)) {
    for (const tagName of tags) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          category,
          isSystem: true,
          status: ModerationStatus.approved,
        },
      });
      createdTags[tagName] = tag.id;
    }
  }

  // Create Admin
  console.log('👤 Creating admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tramplin.ru',
      password: await hashPassword(PASSWORDS.admin),
      displayName: 'Администратор',
      role: UserRole.admin,
      emailVerified: new Date(),
    },
  });

  // Create Curators
  console.log('👤 Creating curators...');
  const curators = [];
  for (let i = 1; i <= 2; i++) {
    const curator = await prisma.user.create({
      data: {
        email: `curator${i}@tramplin.ru`,
        password: await hashPassword(PASSWORDS.curator),
        displayName: `Куратор ${i}`,
        role: UserRole.curator,
        emailVerified: new Date(),
      },
    });
    curators.push(curator);
  }

  // Create Employers
  console.log('👤 Creating employers...');
  const employers = [];
  for (let i = 1; i <= 5; i++) {
    const companyName = generateCompanyName(i);
    const city = CITIES[i % CITIES.length];
    
    const employer = await prisma.user.create({
      data: {
        email: `employer${i}@tramplin.ru`,
        password: await hashPassword(PASSWORDS.employer),
        displayName: companyName,
        role: UserRole.employer,
        emailVerified: new Date(),
        company: {
          create: {
            name: companyName,
            inn: `770000000${i}`,
            website: `https://company${i}.ru`,
            email: `hr@company${i}.ru`,
            description: `${companyName} — технологическая компания. Мы разрабатываем инновационные продукты и сервисы.`,
            industry: 'Информационные технологии',
            city: city.name,
            address: `г. ${city.name}, ул. Технологическая, ${i * 10}`,
            logoUrl: null,
            bannerUrl: null,
            socialLinks: {
              telegram: `https://t.me/company${i}`,
              vk: `https://vk.com/company${i}`,
            },
            verificationStatus: i <= 3 ? VerificationStatus.verified : VerificationStatus.pending,
          },
        },
      },
      include: { company: true },
    });

    // Create verification record for verified employers
    if (i <= 3) {
      await prisma.employerVerification.create({
        data: {
          companyId: employer.company!.id,
          inn: `770000000${i}`,
          corporateEmail: `hr@company${i}.ru`,
          website: `https://company${i}.ru`,
          socialLinks: {
            telegram: `https://t.me/company${i}`,
          },
          documents: [],
          status: VerificationStatus.verified,
          reviewedBy: curators[0].id,
          reviewedAt: new Date(),
        },
      });
    }

    employers.push(employer);
  }

  // Create Applicants
  console.log('👤 Creating applicants...');
  const applicants = [];
  const firstNames = ['Александр', 'Дмитрий', 'Максим', 'Иван', 'Артем', 'Сергей', 'Андрей', 'Алексей', 'Павел', 'Никита', 'Владимир', 'Егор', 'Илья', 'Денис', 'Кирилл', 'Михаил', 'Роман', 'Виктор', 'Глеб', 'Тимофей'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков', 'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов'];

  for (let i = 1; i <= 20; i++) {
    // Use unique combinations to avoid duplicates
    const firstNameIndex = (i - 1) % firstNames.length;
    const lastNameIndex = Math.floor((i - 1) / firstNames.length) % lastNames.length;
    const firstName = firstNames[firstNameIndex];
    const lastName = lastNames[lastNameIndex];
    const fullName = `${firstName} ${lastName}`;
    const university = UNIVERSITIES[i % UNIVERSITIES.length];
    const faculty = FACULTIES[i % FACULTIES.length];
    const city = CITIES[i % CITIES.length];
    
    const applicant = await prisma.user.create({
      data: {
        email: `applicant${i}@tramplin.ru`,
        password: await hashPassword(PASSWORDS.applicant),
        displayName: fullName,
        role: UserRole.applicant,
        emailVerified: new Date(),
        applicantProfile: {
          create: {
            fullName,
            university,
            faculty,
            course: String((i % 4) + 1),
            graduationYear: 2024 + (i % 3),
            city: city.name,
            about: `Студент ${university}, увлекаюсь программированием и новыми технологиями. Ищу возможности для стажировки и развития в сфере IT.`,
            githubUrl: i % 3 === 0 ? `https://github.com/user${i}` : null,
            gitlabUrl: i % 5 === 0 ? `https://gitlab.com/user${i}` : null,
            portfolioUrl: i % 4 === 0 ? `https://portfolio${i}.ru` : null,
            privacyLevel: i % 3 === 0 ? PrivacyLevel.all_authenticated : PrivacyLevel.employers_and_curators,
          },
        },
      },
      include: { applicantProfile: true },
    });

    // Add skills to applicant
    const skillTags = Object.keys(createdTags).slice(i % 5, (i % 5) + 5);
    for (const tagName of skillTags) {
      if (createdTags[tagName]) {
        await prisma.applicantSkillTag.create({
          data: {
            profileId: applicant.applicantProfile!.id,
            tagId: createdTags[tagName],
          },
        });
      }
    }

    // Add projects for some applicants
    if (i % 2 === 0) {
      await prisma.project.create({
        data: {
          profileId: applicant.applicantProfile!.id,
          title: `Проект ${i}`,
          description: 'Учебный проект по разработке веб-приложения',
          url: `https://github.com/user${i}/project`,
          technologies: ['React', 'TypeScript', 'Node.js'],
        },
      });
    }

    // Add experience for some applicants
    if (i % 3 === 0) {
      await prisma.experience.create({
        data: {
          profileId: applicant.applicantProfile!.id,
          company: 'IT Компания',
          position: 'Junior Developer',
          description: 'Разработка веб-приложений',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          isCurrent: false,
        },
      });
    }

    applicants.push(applicant);
  }

  // Create Opportunities
  console.log('💼 Creating opportunities...');
  const opportunities = [];
  let oppCount = 0;

  for (const employer of employers) {
    if (!employer.company) continue;
    
    const isVerified = employer.company.verificationStatus === VerificationStatus.verified;
    const numOpportunities = isVerified ? 8 : 2;
    
    for (let i = 0; i < numOpportunities; i++) {
      oppCount++;
      const typeKeys = Object.keys(OPPORTUNITY_TITLES) as OpportunityType[];
      const type = typeKeys[oppCount % typeKeys.length];
      const titles = OPPORTUNITY_TITLES[type];
      const title = titles[i % titles.length];
      
      const formatKeys = Object.values(OpportunityFormat);
      const format = formatKeys[oppCount % formatKeys.length];
      
      const levelKeys = Object.values(Level);
      const level = levelKeys[oppCount % levelKeys.length];
      
      const employmentKeys = Object.values(EmploymentType);
      const employmentType = employmentKeys[oppCount % employmentKeys.length];
      
      const city = employer.company.city;
      const cityData = CITIES.find(c => c.name === city) || CITIES[0];
      
      // Add some randomness to coordinates
      const lat = cityData.lat + (Math.random() - 0.5) * 0.1;
      const lng = cityData.lng + (Math.random() - 0.5) * 0.1;

      const opportunity = await prisma.opportunity.create({
        data: {
          companyId: employer.company.id,
          title,
          shortDescription: `Отличная возможность для ${level} уровня в сфере ${type}. Присоединяйтесь к команде ${employer.company.name}!`,
          fullDescription: `Мы ищем талантливого специалиста на позицию ${title}. 

## О компании
${employer.company.name} — ${employer.company.description}

## Требования
- Знание современных технологий
- Опыт работы или учебные проекты
- Коммуникабельность и командный дух
- Желание развиваться

## Что мы предлагаем
- Интересные задачи и проекты
- Наставничество от опытных коллег
- Возможность роста и развития
- Конкурентная зарплата`,
          requirements: '- Знание основ программирования\n- Опыт с современными фреймворками\n- Английский язык на уровне чтения документации',
          responsibilities: '- Разработка и поддержка проектов\n- Участие в код-ревью\n- Взаимодействие с командой',
          type,
          format,
          level,
          employmentType,
          city: format === OpportunityFormat.remote || format === OpportunityFormat.online ? null : city,
          address: format === OpportunityFormat.remote || format === OpportunityFormat.online ? null : employer.company.address,
          latitude: format === OpportunityFormat.remote || format === OpportunityFormat.online ? null : lat,
          longitude: format === OpportunityFormat.remote || format === OpportunityFormat.online ? null : lng,
          salaryFrom: type === OpportunityType.internship ? 30000 : 80000,
          salaryTo: type === OpportunityType.internship ? 60000 : 150000,
          salaryCurrency: 'RUB',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: type === OpportunityType.career_event ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : null,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          publishedAt: isVerified ? new Date() : null,
          status: isVerified ? OpportunityStatus.active : OpportunityStatus.draft,
          contacts: {
            email: employer.company.email,
            telegram: employer.company.socialLinks?.telegram,
          },
          infoResources: {
            website: employer.company.website,
            careerPage: `${employer.company.website}/careers`,
          },
        },
      });

      // Add tags to opportunity
      const tagNames = Object.keys(createdTags).slice((oppCount * 3) % 20, ((oppCount * 3) % 20) + 5);
      for (const tagName of tagNames) {
        if (createdTags[tagName]) {
          await prisma.opportunityTag.create({
            data: {
              opportunityId: opportunity.id,
              tagId: createdTags[tagName],
            },
          });
        }
      }

      opportunities.push(opportunity);
    }
  }

  // Create Favorites
  console.log('⭐ Creating favorites...');
  for (let i = 0; i < 15; i++) {
    const applicant = applicants[i % applicants.length];
    const opportunity = opportunities[i % opportunities.length];
    
    try {
      await prisma.favorite.create({
        data: {
          userId: applicant.id,
          opportunityId: opportunity.id,
        },
      });
    } catch (e) {
      // Ignore duplicates
    }
  }

  // Create Applications
  console.log('📝 Creating applications...');
  const applications = [];
  for (let i = 0; i < 25; i++) {
    const applicant = applicants[i % applicants.length];
    const opportunity = opportunities[i % opportunities.length];
    
    const statusKeys = Object.values(ApplicationStatus);
    const status = statusKeys[i % statusKeys.length];
    
    try {
      const application = await prisma.application.create({
        data: {
          userId: applicant.id,
          opportunityId: opportunity.id,
          coverLetter: `Здравствуйте! Меня заинтересовала вакансия ${opportunity.title}. У меня есть опыт работы с современными технологиями и я хотел бы развиваться в вашей компании.`,
          status,
          employerNotes: status === ApplicationStatus.rejected ? 'К сожалению, не подходим по опыту' : null,
        },
      });

      // Create status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: ApplicationStatus.new,
          notes: 'Заявка создана',
        },
      });

      if (status !== ApplicationStatus.new) {
        await prisma.applicationStatusHistory.create({
          data: {
            applicationId: application.id,
            status,
            notes: 'Статус изменен',
          },
        });
      }

      applications.push(application);
    } catch (e) {
      // Ignore duplicates
    }
  }

  // Update applications count
  for (const opp of opportunities) {
    const count = await prisma.application.count({
      where: { opportunityId: opp.id },
    });
    await prisma.opportunity.update({
      where: { id: opp.id },
      data: { applicationsCount: count },
    });
  }

  // Create Professional Contacts
  console.log('🤝 Creating professional contacts...');
  for (let i = 0; i < 10; i++) {
    const sender = applicants[i % applicants.length];
    const receiver = applicants[(i + 5) % applicants.length];
    
    if (sender.id !== receiver.id) {
      try {
        await prisma.professionalContact.create({
          data: {
            senderId: sender.id,
            receiverId: receiver.id,
            status: i % 3 === 0 ? ContactStatus.accepted : ContactStatus.pending,
            message: 'Привет! Давайте обменяемся контактами и будем на связи по профессиональным вопросам.',
          },
        });
      } catch (e) {
        // Ignore duplicates
      }
    }
  }

  // Create Reports
  console.log('🚨 Creating reports...');
  for (let i = 0; i < 3; i++) {
    const reporter = applicants[i].id;
    const target = employers[i].id;
    
    await prisma.report.create({
      data: {
        reporterId: reporter,
        targetId: target,
        targetType: 'company',
        reason: ReportReason.other,
        description: 'Подозрительная активность',
        status: ReportStatus.pending,
      },
    });
  }

  // Create Moderation Queue Items
  console.log('🔍 Creating moderation queue items...');
  for (let i = 0; i < 5; i++) {
    await prisma.moderationQueueItem.create({
      data: {
        type: i % 2 === 0 ? ModerationItemType.opportunity : ModerationItemType.company,
        targetId: opportunities[i].id,
        targetType: 'opportunity',
        reason: 'На модерации',
        status: ModerationStatus.pending,
      },
    });
  }

  // Create Audit Logs
  console.log('📋 Creating audit logs...');
  for (let i = 0; i < 10; i++) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: AuditAction.create,
        entityType: 'user',
        entityId: applicants[i % applicants.length].id,
        newData: { action: 'User created during seed' },
      },
    });
  }

  // Create Notifications
  console.log('🔔 Creating notifications...');
  for (let i = 0; i < 15; i++) {
    await prisma.notification.create({
      data: {
        userId: applicants[i % applicants.length].id,
        type: NotificationType.system,
        title: 'Добро пожаловать на Трамплин!',
        message: 'Заполните свой профиль, чтобы получать персональные рекомендации.',
        isRead: i % 2 === 0,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Admin: 1`);
  console.log(`  - Curators: ${curators.length}`);
  console.log(`  - Employers: ${employers.length}`);
  console.log(`  - Applicants: ${applicants.length}`);
  console.log(`  - Opportunities: ${opportunities.length}`);
  console.log(`  - Tags: ${Object.keys(createdTags).length}`);
  console.log('');
  console.log('🔑 Demo Credentials:');
  console.log(`  Admin: admin@tramplin.ru / ${PASSWORDS.admin}`);
  console.log(`  Curator: curator1@tramplin.ru / ${PASSWORDS.curator}`);
  console.log(`  Employer: employer1@tramplin.ru / ${PASSWORDS.employer}`);
  console.log(`  Applicant: applicant1@tramplin.ru / ${PASSWORDS.applicant}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
