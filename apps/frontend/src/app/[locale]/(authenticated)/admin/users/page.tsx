'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import { useAdminUsers, type RiskLevel } from '@/hooks/use-admin-users';
import { formatDate, formatPoints } from '@/lib/format-utils';
import { RiskBadge } from '@/components/admin/risk-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

export default function AdminUsersPage() {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data, isLoading, error } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [sortField, setSortField] = useState<
    'createdAt' | 'name' | 'email' | 'riskLevel'
  >('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data
      .filter((user) => {
        const matchesSearch =
          !term ||
          user.id.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          `${user.firstName ?? ''} ${user.lastName ?? ''}`
            .toLowerCase()
            .includes(term);
        const matchesRisk =
          riskFilter === 'all' ? true : user.riskLevel === riskFilter;
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';
        switch (sortField) {
          case 'createdAt':
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
            break;
          case 'name':
            valA = `${a.firstName ?? ''} ${a.lastName ?? ''}`
              .trim()
              .toLowerCase();
            valB = `${b.firstName ?? ''} ${b.lastName ?? ''}`
              .trim()
              .toLowerCase();
            break;
          case 'email':
            valA = a.email.toLowerCase();
            valB = b.email.toLowerCase();
            break;
          case 'riskLevel':
            const riskOrder = { high: 3, medium: 2, low: 1 };
            valA = riskOrder[a.riskLevel];
            valB = riskOrder[b.riskLevel];
            break;
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, riskFilter, sortField, sortDir]);

  return (
    <div className="p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-destructive p-6">{t('error')}</p>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground p-6">{t('empty')}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 px-4 pt-4">
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <Select
                    value={riskFilter}
                    onValueChange={(val: RiskLevel | 'all') =>
                      setRiskFilter(val)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('filters.risk')} />
                    </SelectTrigger>
                    <SelectContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SelectItem value="all">{t('filters.allRisks')}</SelectItem>
                      <SelectItem value="high">{t('filters.highRisk')}</SelectItem>
                      <SelectItem value="medium">{t('filters.mediumRisk')}</SelectItem>
                      <SelectItem value="low">{t('filters.lowRisk')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortField}
                    onValueChange={(
                      val: 'createdAt' | 'name' | 'email' | 'riskLevel',
                    ) => setSortField(val)}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder={t('sortBy')} />
                    </SelectTrigger>
                    <SelectContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SelectItem value="createdAt">
                        {t('sort.createdAt')}
                      </SelectItem>
                      <SelectItem value="name">{t('sort.name')}</SelectItem>
                      <SelectItem value="email">{t('sort.email')}</SelectItem>
                      <SelectItem value="riskLevel">
                        {t('sort.riskLevel')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortDir}
                    onValueChange={(val: 'asc' | 'desc') => setSortDir(val)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t('sort.direction')} />
                    </SelectTrigger>
                    <SelectContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SelectItem value="desc">
                        {sortField === 'createdAt'
                          ? t('sort.desc')
                          : t('sort.descText')}
                      </SelectItem>
                      <SelectItem value="asc">
                        {sortField === 'createdAt'
                          ? t('sort.asc')
                          : t('sort.ascText')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">{t('columns.name')}</th>
                      <th className="px-4 py-3">{t('columns.email')}</th>
                      <th className="px-4 py-3">{t('columns.pointsBalance')}</th>
                      <th className="px-4 py-3">{t('columns.receipts')}</th>
                      <th className="px-4 py-3">{t('columns.redemptions')}</th>
                      <th className="px-4 py-3">{t('columns.riskLevel')}</th>
                      <th className="px-4 py-3">{t('columns.createdAt')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((user) => {
                      return (
                        <tr
                          key={user.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <td className="px-4 py-3">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            {formatPoints(user.pointsBalance)}{' '}
                            {tCommon('points')}
                          </td>
                          <td className="px-4 py-3">{user.receiptsCount}</td>
                          <td className="px-4 py-3">{user.redemptionsCount}</td>
                          <td className="px-4 py-3">
                            <RiskBadge level={user.riskLevel} />
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(user.createdAt, {
                              includeTime: false,
                              monthFormat: 'short',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

