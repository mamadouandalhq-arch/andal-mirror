'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import { useAdminReceipts } from '@/hooks/use-admin-receipts';
import { formatDate } from '@/lib/format-utils';
import { getStatusBadge } from '@/lib/receipt-utils';
import { Badge } from '@/components/ui/badge';
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

export default function AdminPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const { data, isLoading, error } = useAdminReceipts();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [sortField, setSortField] = useState<
    'createdAt' | 'user' | 'email' | 'status'
  >('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc'); // newest first

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data
      .filter((r) => {
        const matchesSearch =
          !term ||
          r.id.toLowerCase().includes(term) ||
          r.user.email.toLowerCase().includes(term) ||
          `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`
            .toLowerCase()
            .includes(term);
        const matchesStatus =
          statusFilter === 'all' ? true : r.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';
        switch (sortField) {
          case 'createdAt':
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
            break;
          case 'user':
            valA = `${a.user.firstName ?? ''} ${a.user.lastName ?? ''}`
              .trim()
              .toLowerCase();
            valB = `${b.user.firstName ?? ''} ${b.user.lastName ?? ''}`
              .trim()
              .toLowerCase();
            break;
          case 'email':
            valA = a.user.email.toLowerCase();
            valB = b.user.email.toLowerCase();
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, statusFilter, sortField, sortDir]);

  return (
    <main className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('receipts.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : error ? (
              <p className="text-destructive p-6">{t('receipts.error')}</p>
            ) : !data || data.length === 0 ? (
              <p className="text-muted-foreground p-6">{t('receipts.empty')}</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 px-4 pt-4">
                  <Input
                    placeholder={t('receipts.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={(
                        val: 'all' | 'pending' | 'approved' | 'rejected',
                      ) => setStatusFilter(val)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue
                          placeholder={t('receipts.filters.status')}
                        />
                      </SelectTrigger>
                      <SelectContent
                        onCloseAutoFocus={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <SelectItem value="all">
                          {t('receipts.filters.allStatuses')}
                        </SelectItem>
                        <SelectItem value="pending">pending</SelectItem>
                        <SelectItem value="approved">approved</SelectItem>
                        <SelectItem value="rejected">rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={sortField}
                      onValueChange={(
                        val: 'createdAt' | 'user' | 'email' | 'status',
                      ) => setSortField(val)}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder={t('receipts.sortBy')} />
                      </SelectTrigger>
                      <SelectContent
                        onCloseAutoFocus={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <SelectItem value="createdAt">
                          {t('receipts.sort.createdAt')}
                        </SelectItem>
                        <SelectItem value="user">
                          {t('receipts.sort.user')}
                        </SelectItem>
                        <SelectItem value="email">
                          {t('receipts.sort.email')}
                        </SelectItem>
                        <SelectItem value="status">
                          {t('receipts.sort.status')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={sortDir}
                      onValueChange={(val: 'asc' | 'desc') => setSortDir(val)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue
                          placeholder={t('receipts.sort.direction')}
                        />
                      </SelectTrigger>
                      <SelectContent
                        onCloseAutoFocus={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <SelectItem value="desc">
                          {sortField === 'createdAt'
                            ? t('receipts.sort.desc')
                            : t('receipts.sort.descText')}
                        </SelectItem>
                        <SelectItem value="asc">
                          {sortField === 'createdAt'
                            ? t('receipts.sort.asc')
                            : t('receipts.sort.ascText')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">
                          {t('receipts.columns.id')}
                        </th>
                        <th className="px-4 py-3">
                          {t('receipts.columns.user')}
                        </th>
                        <th className="px-4 py-3">
                          {t('receipts.columns.email')}
                        </th>
                        <th className="px-4 py-3">
                          {t('receipts.columns.uploaded')}
                        </th>
                        <th className="px-4 py-3">
                          {t('receipts.columns.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((receipt) => {
                        const statusBadge = getStatusBadge(receipt.status);
                        return (
                          <tr
                            key={receipt.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              router.push(`/admin/receipts/${receipt.id}`)
                            }
                          >
                            <td className="px-4 py-3 font-mono text-xs">
                              {receipt.id.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3">
                              {receipt.user.firstName} {receipt.user.lastName}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {receipt.user.email}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(receipt.createdAt, {
                                includeTime: true,
                                monthFormat: 'short',
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={statusBadge.badgeClass}>
                                {receipt.status}
                              </Badge>
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
    </main>
  );
}
