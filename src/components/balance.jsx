import { useQuery } from '@tanstack/react-query';
import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react';
import { useSearchParams } from 'react-router';

import { useAuthContext } from '@/contexts/auth';
import { UserService } from '@/services/user';

import BalanceItem from './balance-item';

const Balance = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const { data } = useQuery({
    queryKey: ['balance', user.id, from, to],
    queryFn: () => {
      return UserService.getBalance({ from, to });
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: Boolean(from) && Boolean(to) && Boolean(user.id),
  });

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-6">
      <BalanceItem label="Saldo" amount={data?.balance} icon={<WalletIcon />} />
      <BalanceItem
        label="Ganhos"
        amount={data?.earnings}
        icon={<TrendingUpIcon className="text-primary-green" />}
      />
      <BalanceItem
        label="Gastos"
        amount={data?.expenses}
        icon={<TrendingDownIcon className="text-primary-red" />}
      />
      <BalanceItem
        label="Investimentos"
        amount={data?.investments}
        icon={<PiggyBankIcon className="text-primary-blue" />}
      />
    </div>
  );
};

export default Balance;
