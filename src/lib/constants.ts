import {
  UserRole,
  OpportunityType,
  OpportunityFormat,
  Level,
  EmploymentType,
  OpportunityStatus,
  VerificationStatus,
  PrivacyLevel,
  ApplicationStatus,
  ContactStatus,
  ModerationStatus,
  ReportStatus,
  ReportReason,
  AuditAction,
  NotificationType,
} from '@prisma/client';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.guest]: 'Гость',
  [UserRole.applicant]: 'Соискатель',
  [UserRole.employer]: 'Работодатель',
  [UserRole.curator]: 'Куратор',
  [UserRole.admin]: 'Администратор',
};

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.internship]: 'Стажировка',
  [OpportunityType.vacancy]: 'Вакансия',
  [OpportunityType.mentoring_program]: 'Менторство',
  [OpportunityType.career_event]: 'Карьерное событие',
};

export const OPPORTUNITY_FORMAT_LABELS: Record<OpportunityFormat, string> = {
  [OpportunityFormat.office]: 'В офисе',
  [OpportunityFormat.hybrid]: 'Гибрид',
  [OpportunityFormat.remote]: 'Удаленно',
  [OpportunityFormat.online]: 'Онлайн',
};

export const LEVEL_LABELS: Record<Level, string> = {
  [Level.intern]: 'Intern',
  [Level.junior]: 'Junior',
  [Level.junior_plus]: 'Junior+',
  [Level.middle]: 'Middle',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.full_time]: 'Полная занятость',
  [EmploymentType.part_time]: 'Частичная занятость',
  [EmploymentType.project]: 'Проектная работа',
  [EmploymentType.temporary]: 'Временная работа',
  [EmploymentType.internship]: 'Стажировка',
};

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  [OpportunityStatus.draft]: 'Черновик',
  [OpportunityStatus.pending_moderation]: 'На модерации',
  [OpportunityStatus.active]: 'Активна',
  [OpportunityStatus.closed]: 'Закрыта',
  [OpportunityStatus.planned]: 'Запланирована',
  [OpportunityStatus.rejected]: 'Отклонена',
  [OpportunityStatus.archived]: 'В архиве',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.draft]: 'Черновик',
  [VerificationStatus.pending]: 'На проверке',
  [VerificationStatus.verified]: 'Верифицирован',
  [VerificationStatus.rejected]: 'Отклонен',
  [VerificationStatus.restricted]: 'Ограничен',
};

export const PRIVACY_LEVEL_LABELS: Record<PrivacyLevel, string> = {
  [PrivacyLevel.only_me]: 'Только я',
  [PrivacyLevel.curators_only]: 'Только кураторы',
  [PrivacyLevel.employers_and_curators]: 'Работодатели и кураторы',
  [PrivacyLevel.all_authenticated]: 'Все авторизованные',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.new]: 'Новый',
  [ApplicationStatus.in_review]: 'На рассмотрении',
  [ApplicationStatus.invited]: 'Приглашение',
  [ApplicationStatus.reserve]: 'В резерве',
  [ApplicationStatus.accepted]: 'Принят',
  [ApplicationStatus.rejected]: 'Отклонен',
  [ApplicationStatus.withdrawn]: 'Отозван',
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  [ContactStatus.pending]: 'Ожидает',
  [ContactStatus.accepted]: 'Принят',
  [ContactStatus.rejected]: 'Отклонен',
  [ContactStatus.blocked]: 'Заблокирован',
};

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  [ModerationStatus.pending]: 'На рассмотрении',
  [ModerationStatus.approved]: 'Одобрено',
  [ModerationStatus.rejected]: 'Отклонено',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.pending]: 'Ожидает',
  [ReportStatus.in_review]: 'На рассмотрении',
  [ReportStatus.resolved]: 'Решено',
  [ReportStatus.dismissed]: 'Отклонено',
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.spam]: 'Спам',
  [ReportReason.inappropriate_content]: 'Неприемлемый контент',
  [ReportReason.fraud]: 'Мошенничество',
  [ReportReason.misleading_info]: 'Вводящая в заблуждение информация',
  [ReportReason.discrimination]: 'Дискриминация',
  [ReportReason.other]: 'Другое',
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  pending_moderation: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  closed: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
  verified: 'bg-green-100 text-green-800',
  new: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  invited: 'bg-indigo-100 text-indigo-800',
};

export const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
];

export const TAG_CATEGORIES = {
  technologies: 'Технологии',
  frameworks: 'Фреймворки',
  db_infra: 'БД и Инфраструктура',
  directions: 'Направления',
};

export const UNIVERSITIES = [
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
];
