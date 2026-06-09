import { Customer, User, Opportunity, Contact, FollowUp, Attachment, Task, Quote } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '张明远',
    email: 'zhangmingyuan@company.com',
    role: 'manager',
    avatar: 'Z',
  },
  {
    id: 'user-2',
    name: '李思琪',
    email: 'lisiqi@company.com',
    role: 'sales',
    avatar: 'L',
  },
  {
    id: 'user-3',
    name: '王浩宇',
    email: 'wanghaoyu@company.com',
    role: 'sales',
    avatar: 'W',
  },
  {
    id: 'user-4',
    name: '陈雨欣',
    email: 'chenyuxin@company.com',
    role: 'sales',
    avatar: 'C',
  },
];

const generateContacts = (customerId: string, count: number): Contact[] => {
  const names = ['张伟', '李娜', '王芳', '刘强', '陈静', '杨洋', '黄磊', '周杰'];
  const positions = ['采购经理', '技术总监', '运营总监', 'CEO', '市场经理', '产品经理'];
  return Array.from({ length: count }, (_, i) => ({
    id: `contact-${customerId}-${i}`,
    customerId,
    name: names[i % names.length],
    position: positions[i % positions.length],
    phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    email: `${names[i % names.length].toLowerCase()}@company.com`,
    isPrimary: i === 0,
  }));
};

const generateFollowUps = (customerId: string, userId: string, count: number): FollowUp[] => {
  const types: FollowUp['type'][] = ['call', 'meeting', 'email', 'other'];
  const contents = [
    '初次电话沟通，了解客户基本需求',
    '客户表示对我们的产品很感兴趣，约定下周演示',
    '产品演示完成，客户反馈良好，希望了解价格',
    '发送报价单，等待客户确认',
    '客户提出一些定制化需求，需要技术评估',
    '第二次会议讨论具体方案和实施计划',
    '价格谈判中，客户希望有更多折扣',
    '合同条款讨论，基本达成一致',
  ];
  const results = ['客户感兴趣', '待进一步沟通', '客户有顾虑', '已发送资料', '约定下次沟通', '客户同意方案'];
  const today = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (count - i) * 3);
    return {
      id: `followup-${customerId}-${i}`,
      customerId,
      type: types[i % types.length],
      content: contents[i % contents.length],
      result: results[i % results.length],
      date: date.toISOString().split('T')[0],
      userId,
      nextContactDate: i === count - 1 ? new Date(today.getTime() + (i + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    };
  });
};

const generateOpportunities = (customerId: string, ownerId: string): Opportunity[] => {
  const stages: Opportunity['stage'][] = ['initial', 'needs', 'proposal', 'negotiation', 'won', 'lost'];
  const names = ['企业数字化转型项目', 'CRM系统升级项目', '数据分析平台建设', '云服务采购项目', '安全防护系统升级'];
  const today = new Date();
  
  const oppCount = Math.floor(Math.random() * 2) + 1;
  
  return Array.from({ length: oppCount }, (_, i) => {
    const stageIndex = Math.floor(Math.random() * 6);
    const stage = stages[stageIndex];
    const expectedDate = new Date(today);
    expectedDate.setMonth(expectedDate.getMonth() + stageIndex + 1);
    
    const quotes: Quote[] = stageIndex >= 2 ? [
      {
        id: `quote-${customerId}-${i}-1`,
        opportunityId: `opp-${customerId}-${i}`,
        amount: Math.floor(Math.random() * 500000) + 100000,
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '初次报价，包含基础功能',
        createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      ...(stageIndex >= 3 ? [{
        id: `quote-${customerId}-${i}-2`,
        opportunityId: `opp-${customerId}-${i}`,
        amount: Math.floor(Math.random() * 500000) + 100000,
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '二次报价，增加定制开发内容',
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }] : []),
    ] : [];
    
    return {
      id: `opp-${customerId}-${i}`,
      customerId,
      name: names[i % names.length],
      stage,
      amount: Math.floor(Math.random() * 1000000) + 50000,
      probability: stage === 'won' ? 100 : stage === 'lost' ? 0 : (stageIndex + 1) * 15,
      expectedCloseDate: expectedDate.toISOString().split('T')[0],
      ownerId,
      createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quotes,
    };
  });
};

const generateTasks = (customerId: string, assignedTo: string, count: number): Task[] => {
  const titles = ['电话跟进客户需求', '发送产品资料', '安排产品演示', '准备报价方案', '合同审核', '客户回访'];
  const today = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      id: `task-${customerId}-${i}`,
      customerId,
      title: titles[i % titles.length],
      date: date.toISOString().split('T')[0],
      completed: Math.random() > 0.5,
      assignedTo,
    };
  });
};

const generateAttachments = (customerId: string, count: number): Attachment[] => {
  const fileNames = ['客户需求文档.docx', '产品报价单.pdf', '合同模板.docx', '演示PPT.pptx', '技术方案.pdf'];
  const types = ['application/docx', 'application/pdf', 'application/docx', 'application/pptx', 'application/pdf'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `attachment-${customerId}-${i}`,
    customerId,
    name: fileNames[i % fileNames.length],
    type: types[i % types.length],
    size: Math.floor(Math.random() * 5000000) + 100000,
    url: `/attachments/${customerId}/${i}`,
    uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
};

const customerNames = [
  { name: '北京智联科技有限公司', industry: '互联网', size: 'large' as const },
  { name: '上海金融投资集团', industry: '金融', size: 'large' as const },
  { name: '深圳创新电子科技', industry: '制造业', size: 'medium' as const },
  { name: '广州零售连锁集团', industry: '零售', size: 'large' as const },
  { name: '杭州在线教育平台', industry: '教育', size: 'medium' as const },
  { name: '成都医疗器械公司', industry: '医疗', size: 'medium' as const },
  { name: '武汉房地产开发公司', industry: '房地产', size: 'large' as const },
  { name: '南京能源科技公司', industry: '能源', size: 'medium' as const },
  { name: '青岛物流运输公司', industry: '物流', size: 'small' as const },
  { name: '西安软件开发工作室', industry: '互联网', size: 'small' as const },
  { name: '重庆汽车零部件公司', industry: '制造业', size: 'medium' as const },
  { name: '天津贸易进出口公司', industry: '其他', size: 'small' as const },
];

const sources = ['官网', '转介绍', '展会', '电话营销', '网络推广', '合作伙伴'];
const levels: Customer['level'][] = ['A', 'B', 'C', 'D'];

export const mockCustomers: Customer[] = customerNames.map((cust, index) => {
  const ownerId = mockUsers[(index % (mockUsers.length - 1)) + 1].id;
  const customerId = `customer-${index + 1}`;
  const today = new Date();
  const createdAt = new Date(today.getTime() - (index + 10) * 24 * 60 * 60 * 1000);
  const lastFollowUp = new Date(today.getTime() - index * 2 * 24 * 60 * 60 * 1000);
  
  return {
    id: customerId,
    name: cust.name,
    industry: cust.industry,
    size: cust.size,
    source: sources[index % sources.length],
    level: levels[index % levels.length],
    address: ['北京市朝阳区建国路88号', '上海市浦东新区陆家嘴金融中心', '深圳市南山区科技园', '广州市天河区珠江新城', '杭州市西湖区文三路', '成都市高新区天府大道', '武汉市武昌区中北路', '南京市鼓楼区中山路', '青岛市市南区香港中路', '西安市雁塔区高新路', '重庆市江北区观音桥', '天津市和平区南京路'][index],
    website: `https://www.${cust.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
    ownerId,
    createdAt: createdAt.toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    lastFollowUp: lastFollowUp.toISOString().split('T')[0],
    contacts: generateContacts(customerId, Math.floor(Math.random() * 2) + 1),
    followUps: generateFollowUps(customerId, ownerId, Math.floor(Math.random() * 4) + 2),
    attachments: generateAttachments(customerId, Math.floor(Math.random() * 3) + 1),
    opportunities: generateOpportunities(customerId, ownerId),
    tasks: generateTasks(customerId, ownerId, Math.floor(Math.random() * 3) + 1),
  };
});

export const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getDaysUntil = (date: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
