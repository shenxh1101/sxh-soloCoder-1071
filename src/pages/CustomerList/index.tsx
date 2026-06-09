import { useState } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { CustomerCard } from '../../components/CustomerCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { SOURCES, INDUSTRIES, Customer } from '../../types';
import { useNavigate } from 'react-router-dom';

const levelOptions = [
  { value: '', label: '全部等级' },
  { value: 'A', label: 'A级' },
  { value: 'B', label: 'B级' },
  { value: 'C', label: 'C级' },
  { value: 'D', label: 'D级' },
];

const sourceOptions = [
  { value: '', label: '全部来源' },
  ...SOURCES.map(s => ({ value: s, label: s })),
];

const ownerOptions = [
  { value: '', label: '全部负责人' },
];

const sizeOptions = [
  { value: 'small', label: '小型' },
  { value: 'medium', label: '中型' },
  { value: 'large', label: '大型' },
];

export const CustomerList = () => {
  const navigate = useNavigate();
  const { customers, users, getFilteredCustomers, filters, setFilters, addCustomer, currentUser } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: 'medium' as Customer['size'],
    source: '',
    level: 'C' as Customer['level'],
    address: '',
    website: '',
    contactName: '',
    contactPosition: '',
    contactPhone: '',
    contactEmail: '',
  });

  const filteredCustomers = getFilteredCustomers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData = formData.contactName ? {
      name: formData.contactName,
      position: formData.contactPosition,
      phone: formData.contactPhone,
      email: formData.contactEmail,
      isPrimary: true,
    } : undefined;

    addCustomer({
      name: formData.name,
      industry: formData.industry,
      size: formData.size,
      source: formData.source,
      level: formData.level,
      address: formData.address,
      website: formData.website,
      ownerId: currentUser.id,
    }, contactData);

    setIsModalOpen(false);
    setFormData({
      name: '',
      industry: '',
      size: 'medium',
      source: '',
      level: 'C',
      address: '',
      website: '',
      contactName: '',
      contactPosition: '',
      contactPhone: '',
      contactEmail: '',
    });
  };

  const allOwnerOptions = [
    ...ownerOptions,
    ...users.map(u => ({ value: u.id, label: u.name })),
  ];

  const allIndustryOptions = [
    { value: '', label: '请选择行业' },
    ...INDUSTRIES.map(i => ({ value: i, label: i })),
  ];

  const allSourceOptions = [
    { value: '', label: '请选择来源' },
    ...SOURCES.map(s => ({ value: s, label: s })),
  ];

  const levelFilterOptions = [
    { value: 'A', label: 'A级' },
    { value: 'B', label: 'B级' },
    { value: 'C', label: 'C级' },
    { value: 'D', label: 'D级' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            客户管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            共 {filteredCustomers.length} 个客户
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            筛选
            {(filters.level || filters.source || filters.ownerId) && (
              <Badge variant="danger" size="sm">
                {[filters.level, filters.source, filters.ownerId].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            新增客户
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">筛选条件</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
              >
                重置
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="客户等级"
              value={filters.level || ''}
              onChange={(e) => setFilters({ ...filters, level: e.target.value || undefined })}
              options={levelOptions}
            />
            <Select
              label="客户来源"
              value={filters.source || ''}
              onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined })}
              options={sourceOptions}
            />
            <Select
              label="负责人"
              value={filters.ownerId || ''}
              onChange={(e) => setFilters({ ...filters, ownerId: e.target.value || undefined })}
              options={allOwnerOptions}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {levelFilterOptions.map(level => (
              <button
                key={level.value}
                onClick={() => setFilters({
                  ...filters,
                  level: filters.level === level.value ? undefined : level.value
                })}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.level === level.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg">
          <p className="text-slate-500">暂无客户数据</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setIsModalOpen(true)}
          >
            添加第一个客户
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="animate-in fade-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CustomerCard customer={customer} />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新增客户"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="客户名称 *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入客户名称"
              required
            />
            <Select
              label="所属行业 *"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={allIndustryOptions}
              required
            />
            <Select
              label="企业规模"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value as Customer['size'] })}
              options={sizeOptions}
            />
            <Select
              label="客户来源 *"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              options={allSourceOptions}
              required
            />
            <Select
              label="客户等级"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as Customer['level'] })}
              options={[
                { value: 'A', label: 'A级 - 重点客户' },
                { value: 'B', label: 'B级 - 优质客户' },
                { value: 'C', label: 'C级 - 普通客户' },
                { value: 'D', label: 'D级 - 潜在客户' },
              ]}
            />
            <Input
              label="公司网站"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://"
            />
          </div>

          <div>
            <Input
              label="公司地址"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="请输入公司地址"
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-medium text-slate-900 mb-4">联系人信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="联系人姓名"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="请输入联系人姓名"
              />
              <Input
                label="职位"
                value={formData.contactPosition}
                onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
                placeholder="请输入职位"
              />
              <Input
                label="联系电话"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="请输入联系电话"
              />
              <Input
                label="电子邮箱"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="请输入电子邮箱"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit">
              创建客户
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
