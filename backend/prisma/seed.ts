import { PrismaClient, DurationType, TaskStatus } from '@prisma/client';

import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const roles = [
    {
      id: 'role_01',
      name: 'SuperAdmin',
      nameValue: 'SUPER_ADMIN',
      description: 'Super Administrator with full system access',
    },
    {
      id: 'role_02',
      name: 'Admin',
      nameValue: 'ADMIN',
      description: 'Organization Administrator',
    },
    {
      id: 'role_03',
      name: 'User',
      nameValue: 'USER',
      description: 'Regular User',
    },
  ];

  console.log('📝 Creating roles...');
  for (const role of roles) {
    await prisma.ms_Role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Create permissions
  const permissions = [
    // Employee permissions
    {
      id: 'permission_01',
      name: 'Employee.read',
      description: 'Read employee data',
    },
    {
      id: 'permission_02',
      name: 'Employee.update',
      description: 'Update employee data',
    },
    {
      id: 'permission_03',
      name: 'Employee.create',
      description: 'Create employee data',
    },
    {
      id: 'permission_04',
      name: 'Employee.delete',
      description: 'Delete employee data',
    },
    // Task permissions
    { id: 'permission_07', name: 'Task.read', description: 'Read task data' },
    {
      id: 'permission_08',
      name: 'Task.update',
      description: 'Update task data',
    },
    {
      id: 'permission_09',
      name: 'Task.delete',
      description: 'Delete task data',
    },
    {
      id: 'permission_10',
      name: 'Task.create',
      description: 'Create task data',
    },
    // System permissions
    {
      id: 'permission_11',
      name: 'System.read',
      description: 'Read system data',
    },
    {
      id: 'permission_12',
      name: 'System.update',
      description: 'Update system data',
    },
    {
      id: 'permission_13',
      name: 'System.create',
      description: 'Create system data',
    },
    {
      id: 'permission_14',
      name: 'System.delete',
      description: 'Delete system data',
    },
  ];

  console.log('🔐 Creating permissions...');
  for (const permission of permissions) {
    await prisma.ms_Permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }
  const permByName = Object.fromEntries(permissions.map((p) => [p.name, p.id]));
 
  // Create role-permission m
  // แล้วประกาศ rolePermissions แบบนี้
  const rolePermissions = [
    // SuperAdmin
    { roleId: roles[0].id, permissionId: permByName['Employee.read'] },
    { roleId: roles[0].id, permissionId: permByName['Employee.update'] },
    { roleId: roles[0].id, permissionId: permByName['Employee.create'] },
    { roleId: roles[0].id, permissionId: permByName['Employee.delete'] },
    { roleId: roles[0].id, permissionId: permByName['Task.read'] },
    { roleId: roles[0].id, permissionId: permByName['Task.update'] },
    { roleId: roles[0].id, permissionId: permByName['Task.delete'] },
    { roleId: roles[0].id, permissionId: permByName['Task.create'] },
    { roleId: roles[0].id, permissionId: permByName['System.read'] },
    { roleId: roles[0].id, permissionId: permByName['System.update'] },
    { roleId: roles[0].id, permissionId: permByName['System.create'] },
    { roleId: roles[0].id, permissionId: permByName['System.delete'] },

    // Admin
    { roleId: roles[1].id, permissionId: permByName['Task.read'] },
    { roleId: roles[1].id, permissionId: permByName['Task.update'] },
    { roleId: roles[1].id, permissionId: permByName['Task.delete'] },
    { roleId: roles[1].id, permissionId: permByName['Task.create'] },
    { roleId: roles[1].id, permissionId: permByName['Employee.read'] },

    // User
    { roleId: roles[2].id, permissionId: permByName['Task.read'] },
    { roleId: roles[2].id, permissionId: permByName['Task.update'] },
    { roleId: roles[2].id, permissionId: permByName['Employee.read'] },
  ];
  console.log('🔗 Creating role-permission mappings...');
  for (const rp of rolePermissions) {
    await prisma.sa_RolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: rp.roleId,
          permissionId: rp.permissionId,
        },
      },
      update: {},
      create: {
        roleId: rp.roleId,
        permissionId: rp.permissionId,
        createdBy: 'system',
      },
    });
  }

  const users = [
    { id: 'user_01', email: 'superadmin@gmail.com', password: 'password123' },
    {
      id: 'user_02',
      email: 'admin.drawing@gmail.com',
      password: 'password123',
    },
    {
      id: 'user_03',
      email: 'admin.purchasing@gmail.com',
      password: 'password123',
    },
    {
      id: 'user_04',
      email: 'admin.engineering@gmail.com',
      password: 'password123',
    },
    {
      id: 'user_05',
      email: 'drawing.staff@gmail.com',
      password: 'password123',
    },
    {
      id: 'user_06',
      email: 'purchasing.staff@gmail.com',
      password: 'password123',
    },
    {
      id: 'user_07',
      email: 'engineering.staff@gmail.com',
      password: 'password123',
    },
  ];

  console.log('👤 Creating users...');
  for (const user of users) {
    const normalizedEmail = user.email.toLowerCase();
    await prisma.ss_User.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: {
        id: user.id,
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(user.password, 10),
        isVerify: true,
      },
    });
  }

  // Assign roles to users
  console.log('🎭 Assigning roles to users...');
  const userRoles = [
    { userId: users[0].id, roleId: roles[0].id }, // SuperAdmin
    { userId: users[1].id, roleId: roles[1].id }, // Admin แผนกเขียนแบบ
    { userId: users[2].id, roleId: roles[1].id }, // Admin แผนกจัดซื้อ
    { userId: users[3].id, roleId: roles[1].id }, // Admin แผนกเอนจิเนีย
    { userId: users[4].id, roleId: roles[2].id }, // วิศวกรเขียนแบบ
    { userId: users[5].id, roleId: roles[2].id }, // เจ้าหน้าที่จัดซื้อ
    { userId: users[6].id, roleId: roles[2].id }, // วิศวกรเอนจิเนีย
  ];

  for (const userRole of userRoles) {
    await prisma.sa_UserRole.upsert({
      where: {
        userId_roleId: {
          userId: userRole.userId,
          roleId: userRole.roleId,
        },
      },
      update: {},
      create: {
        userId: userRole.userId,
        roleId: userRole.roleId,
        createdBy: 'system',
      },
    });
  }

  // Create sample organizations
  const organizations = [
    {
      id: 'org_01',
      name: 'บริษัท เอบีซี จำกัด',
      address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
      logoUrl: null,
    },
  ];

  console.log('🏢 Creating organizations...');
  for (const org of organizations) {
    await prisma.ss_Organization.upsert({
      where: { id: org.id },
      update: {},
      create: {
        ...org,
      },
    });
  }

  // Create sample departments (without headOfDepartmentId first)
  const departments = [
    {
      id: 'dept_01',
      name: 'เขียนแบบ',
      organizationId: organizations[0].id,
      isAdminApprover: false,
      isSiteKw: false,
    },
    {
      id: 'dept_02',
      name: 'จัดซื้อ',
      organizationId: organizations[0].id,
      isAdminApprover: false,
      isSiteKw: true,
    },
    {
      id: 'dept_03',
      name: 'เอนจิเนีย',
      organizationId: organizations[0].id,
      isAdminApprover: true,
      isSiteKw: false,
    },
  ];

  console.log('🏬 Creating departments...');
  for (const dept of departments) {
    await prisma.ss_Department.upsert({
      where: { id: dept.id },
      update: {},
      create: {
        ...dept,
      },
    });
  }

  // Create sample positions
  const positions = [
  { id: 'pos_01', name: 'วิศวกรเขียนแบบ', departmentId: departments[0].id },
  { id: 'pos_02', name: 'เจ้าหน้าที่จัดซื้อ', departmentId: departments[1].id },
  { id: 'pos_03', name: 'วิศวกรเอนจิเนีย', departmentId: departments[2].id },
  { id: 'pos_04', name: 'วิศวกรอาวุโส', departmentId: departments[0].id },   // เดิมหัวหน้าแผนก เขียนแบบ
  { id: 'pos_05', name: 'เจ้าหน้าที่อาวุโส', departmentId: departments[1].id }, // เดิมหัวหน้าแผนก จัดซื้อ
  { id: 'pos_06', name: 'วิศวกรอาวุโส', departmentId: departments[2].id },   // เดิมหัวหน้าแผนก เอนจิเนีย
];

  console.log('💼 Creating positions...');
  for (const pos of positions) {
    await prisma.ss_Position.upsert({
      where: { id: pos.id },
      update: {},
      create: {
        ...pos,
      },
    });
  }

  // Create sample employees (using userId as primary key)
  const employees = [
    {
      userId: users[0].id,
      prefix: 'Mr.',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phone: '081-111-1111',
      positionId: null,
      organizationId: organizations[0].id,
      departmentId: null,
      description: 'ผู้ดูแลระบบ',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
    {
      userId: users[1].id,
      prefix: 'Ms.',
      firstName: 'สมหญิง',
      lastName: 'รักงาน',
      phone: '081-222-2222',
      positionId: positions[3].id,
      organizationId: organizations[0].id,
      departmentId: departments[0].id,
      description: 'หัวหน้าแผนกเขียนแบบ',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
    {
      userId: users[2].id,
      prefix: 'Mr.',
      firstName: 'สมศักดิ์',
      lastName: 'เก่งกล้า',
      phone: '081-333-3333',
      positionId: positions[4].id,
      organizationId: organizations[0].id,
      departmentId: departments[1].id,
      description: 'หัวหน้าแผนกจัดซื้อ',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
    {
      userId: users[3].id,
      prefix: 'Ms.',
      firstName: 'สมปอง',
      lastName: 'วิศวกร',
      phone: '081-444-4444',
      positionId: positions[5].id,
      organizationId: organizations[0].id,
      departmentId: departments[2].id,
      description: 'หัวหน้าแผนกเอนจิเนีย',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
    {
      userId: users[4].id,
      prefix: 'Ms.',
      firstName: 'สมใจ',
      lastName: 'ตั้งใจ',
      phone: '081-555-5555',
      positionId: positions[0].id,
      organizationId: organizations[0].id,
      departmentId: departments[0].id,
      description: 'วิศวกรเขียนแบบ',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
    {
      userId: users[5].id,
      prefix: 'Mr.',
      firstName: 'สมหมาย',
      lastName: 'มุ่งมั่น',
      phone: '081-666-6666',
      positionId: positions[1].id,
      organizationId: organizations[0].id,
      departmentId: departments[1].id,
      description: 'เจ้าหน้าที่จัดซื้อ',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
    {
      userId: users[6].id,
      prefix: 'Mr.',
      firstName: 'สมคิด',
      lastName: 'คิดดี',
      phone: '081-777-7777',
      positionId: positions[2].id,
      organizationId: organizations[0].id,
      departmentId: departments[2].id,
      description: 'วิศวกรเอนจิเนีย',
      isActive: true,
      createdAt: new Date('2025-09-05'),
    },
  ];

  console.log('👥 Creating employees...');
  for (const emp of employees) {
    await prisma.ss_Employee.upsert({
      where: { userId: emp.userId },
      update: {},
      create: {
        ...emp,
      },
    });
  }

  // Update departments with headOfDepartmentId after employees are created
  console.log('🏬 Updating departments with head of department...');
  await prisma.ss_Department.update({
    where: { id: 'dept_01' },
    data: { headOfDepartmentId: users[1].id }, // แอดมินแผนกเขียนแบบเป็นหัวหน้า
  });

  await prisma.ss_Department.update({
    where: { id: 'dept_02' },
    data: { headOfDepartmentId: users[2].id }, // แอดมินแผนกจัดซื้อเป็นหัวหน้า
  });

  await prisma.ss_Department.update({
    where: { id: 'dept_03' },
    data: { headOfDepartmentId: users[3].id }, // แอดมินแผนกเอนจิเนียเป็นหัวหน้า
  });

  // Create sample job types
  const jobTypes = [
    // แผนกเขียนแบบ
    {
      id: 'jobtype_01',
      name: 'เขียนแบบโครงสร้าง',
      description: 'งานเขียนแบบโครงสร้างอาคารและสิ่งปลูกสร้าง',
      durationType: DurationType.week,
      duration: 2,
      departmentId: departments[0].id,
      color: '#FFC1B5',
    },
    {
      id: 'jobtype_02',
      name: 'เขียนแบบสถาปัตยกรรม',
      description: 'งานเขียนแบบสถาปัตยกรรมและการตกแต่งภายใน',
      durationType: DurationType.week,
      duration: 2,
      departmentId: departments[0].id,
      color: '#B5E7FF',
    },
    // แผนกจัดซื้อ (แผนกพิเศษ isSiteKw)
    {
      id: 'jobtype_03',
      name: 'จัดซื้อวัสดุก่อสร้าง',
      description: 'งานจัดซื้อวัสดุและอุปกรณ์ก่อสร้าง',
      durationType: DurationType.week,
      duration: 1,
      departmentId: departments[1].id,
      color: '#C1FFB5',
    },
    {
      id: 'jobtype_04',
      name: 'จัดซื้ออุปกรณ์ไฟฟ้า',
      description: 'งานจัดซื้ออุปกรณ์และเครื่องมือไฟฟ้า',
      durationType: DurationType.week,
      duration: 1,
      departmentId: departments[1].id,
      color: '#FFB5E7',
    },
    // แผนกเอนจิเนีย (ต้องรออนุมัติ isAdminApprover)
    {
      id: 'jobtype_05',
      name: 'ออกแบบระบบ',
      description: 'งานออกแบบระบบวิศวกรรม',
      durationType: DurationType.week,
      duration: 3,
      departmentId: departments[2].id,
      color: '#E7B5FF',
    },
    {
      id: 'jobtype_06',
      name: 'ตรวจสอบคุณภาพ',
      description: 'งานตรวจสอบและควบคุมคุณภาพงานวิศวกรรม',
      durationType: DurationType.week,
      duration: 2,
      departmentId: departments[2].id,
      color: '#B5FFE7',
    },
  ];

  console.log('💼 Creating job types...');
  for (const jobType of jobTypes) {
    await prisma.ss_JobType.upsert({
      where: { id: jobType.id },
      update: {},
      create: {
        ...jobType,
      },
    });
  }

  // Create sample tasks
  const tasks = [
    // แผนกเขียนแบบ
    {
      id: 'task_01',
      employeeId: employees[4].userId, // วิศวกรเขียนแบบ
      jobName: 'เขียนแบบอาคารสำนักงาน',
      jobTypeId: jobTypes[0].id,
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-19'),
      description: 'เขียนแบบโครงสร้างอาคารสำนักงาน 5 ชั้น',
      status: TaskStatus.in_progress,
      assignedBy: employees[1].userId, // หัวหน้าแผนกเขียนแบบ
    },
    {
      id: 'task_02',
      employeeId: employees[4].userId, // วิศวกรเขียนแบบ
      jobName: 'เขียนแบบตกแต่งภายใน',
      jobTypeId: jobTypes[1].id,
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-19'),
      description: 'เขียนแบบตกแต่งภายในสำนักงานใหญ่',
      status: TaskStatus.pending,
      assignedBy: employees[1].userId, // หัวหน้าแผนกเขียนแบบ
    },
    // แผนกจัดซื้อ (แผนกพิเศษ)
    {
      id: 'task_03',
      employeeId: employees[5].userId, // เจ้าหน้าที่จัดซื้อ
      jobName: 'จัดซื้อวัสดุก่อสร้างโครงการใหม่',
      jobTypeId: jobTypes[2].id,
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-12'),
      description: 'จัดซื้อวัสดุก่อสร้างสำหรับโครงการอาคารใหม่',
      status: TaskStatus.in_progress,
      assignedBy: employees[2].userId, // หัวหน้าแผนกจัดซื้อ
    },
    {
      id: 'task_04',
      employeeId: employees[5].userId, // เจ้าหน้าที่จัดซื้อ
      jobName: 'จัดซื้ออุปกรณ์ไฟฟ้าประจำปี',
      jobTypeId: jobTypes[3].id,
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-12'),
      description: 'จัดซื้ออุปกรณ์ไฟฟ้าสำหรับการบำรุงรักษาประจำปี',
      status: TaskStatus.pending,
      assignedBy: employees[2].userId, // หัวหน้าแผนกจัดซื้อ
    },
    // แผนกเอนจิเนีย (ต้องรออนุมัติ)
    {
      id: 'task_05',
      employeeId: employees[6].userId, // วิศวกรเอนจิเนีย
      jobName: 'ออกแบบระบบระบายน้ำ',
      jobTypeId: jobTypes[4].id,
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-26'),
      description: 'ออกแบบระบบระบายน้ำสำหรับโครงการใหม่',
      status: TaskStatus.waiting_Approv,
      assignedBy: employees[3].userId, // หัวหน้าแผนกเอนจิเนีย
    },
    {
      id: 'task_06',
      employeeId: employees[6].userId, // วิศวกรเอนจิเนีย
      jobName: 'ตรวจสอบคุณภาพงานก่อสร้าง',
      jobTypeId: jobTypes[5].id,
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-19'),
      description: 'ตรวจสอบและควบคุมคุณภาพงานก่อสร้างโครงการ A',
      status: TaskStatus.waiting_Approv,
      assignedBy: employees[3].userId, // หัวหน้าแผนกเอนจิเนีย
    },
  ];

  console.log('📋 Creating tasks...');
  for (const task of tasks) {
    await prisma.ss_Task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...task,
      },
    });
  }

  // Create sample task files
  const taskFiles = [
    {
      id: 'taskfile_01',
      taskId: tasks[0].id,
      fileName: 'kpi-system-design.pdf',
      fileSize: 2048576,
      filePath: '/uploads/tasks/kpi-system-design.pdf',
      downloadUrl: 'https://example.com/files/kpi-system-design.pdf',
    },
  ];

  console.log('📎 Creating task files...');
  for (const file of taskFiles) {
    await prisma.ss_TaskFile.upsert({
      where: { id: file.id },
      update: {},
      create: {
        ...file,
      },
    });
  }

  const weekends = [
    { dayOfWeek: 6, isActive: true }, // Saturday
  ];

  console.log('🗓️ Creating weekends...');
  for (const weekend of weekends) {
    await prisma.ss_Weekend.upsert({
      where: { dayOfWeek: weekend.dayOfWeek },
      update: {},
      create: {
        ...weekend,
        createdBy: 'system',
      },
    });
  }

  // Display summary
  const totalRoles = await prisma.ms_Role.count({
    where: { isDeleted: false },
  });
  const totalPermissions = await prisma.ms_Permission.count({
    where: { isDeleted: false },
  });
  const totalUsers = await prisma.ss_User.count();
  const totalRolePermissions = await prisma.sa_RolePermission.count();
  const totalUserRoles = await prisma.sa_UserRole.count();
  const totalOrganizations = await prisma.ss_Organization.count({
    where: { isDeleted: false },
  });
  const totalDepartments = await prisma.ss_Department.count({
    where: { isDeleted: false },
  });
  const totalPositions = await prisma.ss_Position.count({
    where: { isDeleted: false },
  });
  const totalEmployees = await prisma.ss_Employee.count();
  const totalJobTypes = await prisma.ss_JobType.count({
    where: { isDeleted: false },
  });
  const totalTasks = await prisma.ss_Task.count();
  const totalTaskFiles = await prisma.ss_TaskFile.count();
  const totalWeekends = await prisma.ss_Weekend.count({
    where: { isDeleted: false },
  });
  const totalHolidays = await prisma.ss_Holiday.count({
    where: { isDeleted: false },
  });

  console.log('\n✅ Seed data inserted successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Roles: ${totalRoles}`);
  console.log(`   - Permissions: ${totalPermissions}`);
  console.log(`   - Users: ${totalUsers}`);
  console.log(`   - Role-Permission mappings: ${totalRolePermissions}`);
  console.log(`   - User-Role mappings: ${totalUserRoles}`);
  console.log(`   - Organizations: ${totalOrganizations}`);
  console.log(`   - Departments: ${totalDepartments}`);
  console.log(`   - Positions: ${totalPositions}`);
  console.log(`   - Employees: ${totalEmployees}`);
  console.log(`   - Job Types: ${totalJobTypes}`);
  console.log(`   - Tasks: ${totalTasks}`);
  console.log(`   - Task Files: ${totalTaskFiles}`);
  console.log(`   - Weekends: ${totalWeekends}`);
  console.log(`   - Holidays: ${totalHolidays}`);
  console.log('\n🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
