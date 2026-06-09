import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  Edit2,
  Trash2,
  PhoneCall,
  Users,
  Send,
  MoreHorizontal,
  FileText,
  Upload,
  Download,
  TrendingUp,
  DollarSign,
  Target,
  CalendarDays,
  FileImage,
  FileSpreadsheet,
  File,
  Eye,
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Timeline } from '../../components/Timeline';
import { OpportunityCard } from '../../components/OpportunityCard';
import {
  LEVEL_COLORS,
  SIZE_LABELS,
  FOLLOWUP_TYPE_LABELS,
  FollowUp,
  Contact,
  Opportunity,
  Customer,
  SOURCES,
} from '../../types';
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  getRelativeTime,
  generateId,
  getToday,
  downloadFile,
  getFileIcon,
  readFileAsBase64,
} from '../../utils/helpers';

import { cn } from '../../utils/helpers';

type TabType = 'info' | 'contacts' | 'followups' | 'opportunities' | 'attachments';

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getCustomerById,
    users,
    updateCustomer,
    addContact,
    updateContact,
    deleteContact,
    addFollowUp,
    addAttachment,
    deleteAttachment,
    addOpportunity,
    updateOpportunityStage,
    currentUser,
  } = useCRMStore();

  const customer = getCustomerById(id || '');
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [followUpForm, setFollowUpForm] = useState({
    type: 'call' as FollowUp['type'],
    content: '',
    result: '',
    nextContactDate: '',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  const [opportunityForm, setOpportunityForm] = useState({
    name: '',
    amount: '',
    probability: 30,
    expectedCloseDate: '',
  });

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">客户不存在</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/customers')}>
          返回客户列表
        </Button>
      </div>
    );
  }

  const owner = users.find(u => u.id === customer.ownerId);
  const openOpportunities = customer.opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost');
  const wonOpportunities = customer.opportunities.filter(o => o.stage === 'won');
  const totalWonAmount = wonOpportunities.reduce((sum, o) => sum + o.amount, 0);
  const totalOpenAmount = openOpportunities.reduce((sum, o) => sum + o.amount, 0);

  const tabs = [
    { id: 'info' as TabType, label: '基本信息', icon: Globe },
    { id: 'contacts' as TabType, label: '联系人', icon: Users, count: customer.contacts.length },
    { id: 'followups' as TabType, label: '跟进记录', icon: PhoneCall, count: customer.followUps.length },
    { id: 'opportunities' as TabType, label: '销售机会', icon: Target, count: customer.opportunities.length },
    { id: 'attachments' as TabType, label: '附件', icon: FileText, count: customer.attachments.length },
  ];

  const handleEditClick = () => {
    setEditForm(customer);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editForm.name) {
      updateCustomer(customer.id, editForm);
      setIsEditing(false);
    }
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUp(customer.id, {
      ...followUpForm,
      customerId: customer.id,
      date: getToday(),
      userId: currentUser.id,
      nextContactDate: followUpForm.nextContactDate || undefined,
    });
    setShowFollowUpModal(false);
    setFollowUpForm({
      type: 'call',
      content: '',
      result: '',
      nextContactDate: '',
    });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateContact(customer.id, editingContact.id, contactForm);
    } else {
      addContact(customer.id, {
        ...contactForm,
        customerId: customer.id,
      });
    }
    setShowContactModal(false);
    setEditingContact(null);
    setContactForm({
      name: '',
      position: '',
      phone: '',
      email: '',
      isPrimary: false,
    });
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      position: contact.position,
      phone: contact.phone,
      email: contact.email,
      isPrimary: contact.isPrimary,
    });
    setShowContactModal(true);
  };

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    addOpportunity(customer.id, {
      name: opportunityForm.name,
      stage: 'initial',
      amount: Number(opportunityForm.amount),
      probability: opportunityForm.probability,
      expectedCloseDate: opportunityForm.expectedCloseDate,
      ownerId: currentUser.id,
    });
    setShowOpportunityModal(false);
    setOpportunityForm({
      name: '',
      amount: '',
      probability: 30,
      expectedCloseDate: '',
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        const base64Data = await readFileAsBase64(file);
        addAttachment(customer.id, {
          customerId: customer.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: base64Data,
          data: base64Data,
          uploadedAt: getToday(),
        });
      } catch (error) {
        console.error('文件上传失败:', error);
      }
    }
    e.target.value = '';
  };

  const handleDownload = (attachment: any) => {
    const data = attachment.data || attachment.url;
    downloadFile(data, attachment.name, attachment.type);
  };

  const handlePreview = (attachment: any) => {
    const data = attachment.data || attachment.url;
    window.open(data, '_blank');
  };

  const sourceOptions = SOURCES.map(s => ({ value: s, label: s }));
  const industryOptions = ['互联网', '金融', '制造业', '零售', '教育', '医疗', '房地产', '能源', '物流', '其他'].map(i => ({ value: i, label: i }));
  const sizeOptions = [
    { value: 'small', label: '小型' },
    { value: 'medium', label: '中型' },
    { value: 'large', label: '大型' },
  ];
  const levelOptions = [
    { value: 'A', label: 'A级' },
    { value: 'B', label: 'B级' },
    { value: 'C', label: 'C级' },
    { value: 'D', label: 'D级' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customers')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar name={customer.name} size="xl" variant="square" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                    {customer.name}
                  </h1>
                  <Badge className={LEVEL_COLORS[customer.level]}>
                    {customer.level}级
                  </Badge>
                  <Badge variant="default" size="sm">
                    {customer.source}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {customer.industry}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    {SIZE_LABELS[customer.size]}企业
                  </span>
                  {customer.website && (
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      官网
                    </a>
                  )}
                  {customer.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {customer.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setShowFollowUpModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                跟进记录
              </Button>
              <Button onClick={handleEditClick} className="gap-2">
                <Edit2 className="w-4 h-4" />
                编辑
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{customer.opportunities.length}</p>
              <p className="text-sm text-slate-500">商机总数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalWonAmount)}</p>
              <p className="text-sm text-slate-500">已成交金额</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalOpenAmount)}</p>
              <p className="text-sm text-slate-500">商机金额</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{customer.followUps.length}</p>
              <p className="text-sm text-slate-500">跟进次数</p>
            </div>
          </div>

          {owner && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={owner.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{owner.name}</p>
                  <p className="text-xs text-slate-500">
                    {owner.role === 'manager' ? '销售主管' : '销售人员'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">创建于 {formatDate(customer.createdAt)}</p>
                {customer.lastFollowUp && (
                  <p className="text-xs text-slate-500">
                    上次跟进 {getRelativeTime(customer.lastFollowUp)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-slate-800 text-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge variant="default" size="sm">{tab.count}</Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900">基本信息</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">客户名称</p>
                  <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">所属行业</p>
                  <p className="text-sm font-medium text-slate-900">{customer.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">企业规模</p>
                  <p className="text-sm font-medium text-slate-900">{SIZE_LABELS[customer.size]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">客户等级</p>
                  <p className="text-sm font-medium text-slate-900">{customer.level}级</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">客户来源</p>
                  <p className="text-sm font-medium text-slate-900">{customer.source}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">公司网站</p>
                  <p className="text-sm font-medium text-blue-600">
                    {customer.website || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">公司地址</p>
                  <p className="text-sm font-medium text-slate-900">{customer.address || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900">关键指标</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">进行中商机</p>
                    <p className="text-lg font-bold text-slate-900">{openOpportunities.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">已成交商机</p>
                    <p className="text-lg font-bold text-slate-900">{wonOpportunities.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">待跟进任务</p>
                    <p className="text-lg font-bold text-slate-900">
                      {customer.tasks.filter(t => !t.completed).length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contacts' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold text-slate-900">联系人管理</h3>
            <Button size="sm" onClick={() => setShowContactModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              添加联系人
            </Button>
          </CardHeader>
          <CardContent>
            {customer.contacts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>暂无联系人</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowContactModal(true)}>
                  添加第一个联系人
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {customer.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar name={contact.name} size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{contact.name}</p>
                          {contact.isPrimary && (
                            <Badge variant="success" size="sm">主要联系人</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{contact.position}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5" />
                            {contact.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContact(contact)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContact(customer.id, contact.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowFollowUpModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              添加跟进记录
            </Button>
          </div>
          <Timeline followUps={customer.followUps} />
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">销售机会</h3>
            <Button onClick={() => setShowOpportunityModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              新增商机
            </Button>
          </div>
          {customer.opportunities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-slate-500">
                <p>暂无销售机会</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowOpportunityModal(true)}>
                  创建第一个商机
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customer.opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onStageChange={(stage) => updateOpportunityStage(opp.id, stage)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'attachments' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold text-slate-900">附件管理</h3>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
              />
              <Button size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                上传文件
              </Button>
            </label>
          </CardHeader>
          <CardContent>
            {customer.attachments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>暂无附件</p>
                <label className="cursor-pointer mt-4 inline-block">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button variant="secondary" size="sm">
                    上传第一个文件
                  </Button>
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customer.attachments.map((attachment) => {
                  const fileType = getFileIcon(attachment.type);
                  const FileIconComponent = fileType === 'FileImage' ? FileImage :
                    fileType === 'FileSpreadsheet' ? FileSpreadsheet :
                    fileType === 'FilePresentation' ? FileText :
                    fileType === 'FileText' ? FileText : File;
                  const iconColor = fileType === 'FileImage' ? 'text-emerald-500 bg-emerald-50' :
                    fileType === 'FileSpreadsheet' ? 'text-green-500 bg-green-50' :
                    fileType === 'FilePresentation' ? 'text-orange-500 bg-orange-50' :
                    fileType === 'FileText' ? 'text-blue-500 bg-blue-50' :
                    'text-slate-500 bg-slate-50';

                  return (
                    <div
                      key={attachment.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                          <FileIconComponent className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-sm font-medium text-slate-900 truncate" 
                            title={attachment.name}
                          >
                            {attachment.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {formatFileSize(attachment.size)}
                            </span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-slate-500">
                              {formatDate(attachment.uploadedAt)}
                            </span>
                          </div>
                          {attachment.type && (
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {attachment.type}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handlePreview(attachment)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          title="预览"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          预览
                        </button>
                        <button
                          onClick={() => handleDownload(attachment)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="下载"
                        >
                          <Download className="w-3.5 h-3.5" />
                          下载
                        </button>
                        <button
                          onClick={() => deleteAttachment(customer.id, attachment.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          删除
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="编辑客户信息"
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="客户名称"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <Select
              label="所属行业"
              value={editForm.industry || ''}
              onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              options={industryOptions}
            />
            <Select
              label="企业规模"
              value={editForm.size || 'medium'}
              onChange={(e) => setEditForm({ ...editForm, size: e.target.value as Customer['size'] })}
              options={sizeOptions}
            />
            <Select
              label="客户来源"
              value={editForm.source || ''}
              onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
              options={sourceOptions}
            />
            <Select
              label="客户等级"
              value={editForm.level || 'C'}
              onChange={(e) => setEditForm({ ...editForm, level: e.target.value as Customer['level'] })}
              options={levelOptions}
            />
            <Input
              label="公司网站"
              value={editForm.website || ''}
              onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
            />
          </div>
          <Input
            label="公司地址"
            value={editForm.address || ''}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              保存修改
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        title="添加跟进记录"
      >
        <form onSubmit={handleAddFollowUp} className="p-6 space-y-4">
          <Select
            label="跟进类型"
            value={followUpForm.type}
            onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value as FollowUp['type'] })}
            options={[
              { value: 'call', label: '电话' },
              { value: 'meeting', label: '会议' },
              { value: 'email', label: '邮件' },
              { value: 'other', label: '其他' },
            ]}
          />
          <Textarea
            label="沟通内容"
            value={followUpForm.content}
            onChange={(e) => setFollowUpForm({ ...followUpForm, content: e.target.value })}
            placeholder="请输入沟通内容..."
            rows={4}
            required
          />
          <Textarea
            label="沟通结果"
            value={followUpForm.result}
            onChange={(e) => setFollowUpForm({ ...followUpForm, result: e.target.value })}
            placeholder="请输入沟通结果..."
            rows={2}
            required
          />
          <Input
            label="下次联系日期（可选）"
            type="date"
            value={followUpForm.nextContactDate}
            onChange={(e) => setFollowUpForm({ ...followUpForm, nextContactDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFollowUpModal(false)}
            >
              取消
            </Button>
            <Button type="submit">
              保存记录
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setEditingContact(null);
        }}
        title={editingContact ? '编辑联系人' : '添加联系人'}
      >
        <form onSubmit={handleAddContact} className="p-6 space-y-4">
          <Input
            label="联系人姓名"
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            placeholder="请输入姓名"
            required
          />
          <Input
            label="职位"
            value={contactForm.position}
            onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
            placeholder="请输入职位"
          />
          <Input
            label="联系电话"
            value={contactForm.phone}
            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            placeholder="请输入联系电话"
            required
          />
          <Input
            label="电子邮箱"
            type="email"
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            placeholder="请输入电子邮箱"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={contactForm.isPrimary}
              onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
            />
            <span className="text-sm text-slate-700">设为主要联系人</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowContactModal(false);
                setEditingContact(null);
              }}
            >
              取消
            </Button>
            <Button type="submit">
              {editingContact ? '保存修改' : '添加联系人'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        title="新增销售机会"
      >
        <form onSubmit={handleAddOpportunity} className="p-6 space-y-4">
          <Input
            label="商机名称"
            value={opportunityForm.name}
            onChange={(e) => setOpportunityForm({ ...opportunityForm, name: e.target.value })}
            placeholder="请输入商机名称"
            required
          />
          <Input
            label="预估金额（元）"
            type="number"
            value={opportunityForm.amount}
            onChange={(e) => setOpportunityForm({ ...opportunityForm, amount: e.target.value })}
            placeholder="请输入预估金额"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              成交概率: {opportunityForm.probability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={opportunityForm.probability}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, probability: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <Input
            label="预计成交日期"
            type="date"
            value={opportunityForm.expectedCloseDate}
            onChange={(e) => setOpportunityForm({ ...opportunityForm, expectedCloseDate: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowOpportunityModal(false)}
            >
              取消
            </Button>
            <Button type="submit">
              创建商机
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
