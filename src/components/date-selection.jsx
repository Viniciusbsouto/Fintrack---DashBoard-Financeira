import { useQueryClient } from '@tanstack/react-query';
import { addMonths, isValid, parse } from 'date-fns';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useAuthContext } from '@/contexts/auth';

import { DatePickerWithRange } from './ui/date-picker-with-range';

const formatDateToQueryParam = (date) => format(date, 'yyyy-MM-dd');

const parseDateParam = (param) => {
  const parsed = parse(param, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

const getInitialDateState = (searchParams) => {
  const defaultDate = {
    from: new Date(),
    to: addMonths(new Date(), 1),
  };
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!from || !to) {
    return defaultDate;
  }
  //

  // Neste ponto eu tenho o from e o to
  // Eles são válidos?
  const parsedFrom = parseDateParam(from);
  const parsedTo = parseDateParam(to);

  const dateAreInvalid = !parsedFrom || !parsedTo;
  // Se não forem eu retorno o defaultDate
  if (dateAreInvalid) {
    return defaultDate;
  }
  // Neste ponto ambas as datas são válidas

  return {
    from: parsedFrom,
    to: parsedTo,
  };
};

const DateSelection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [date, setDate] = useState(getInitialDateState(searchParams));
  // 1. Sempre que o state "date" mudar, eu preciso persisti-lo na URL (?from&to=)
  useEffect(() => {
    if (!date?.from || !date?.to) return;

    const queryParams = new URLSearchParams();
    queryParams.set('from', formatDateToQueryParam(date.from));
    queryParams.set('to', formatDateToQueryParam(date.to));
    navigate(`/?${queryParams.toString()}`);
    queryClient.invalidateQueries({
      queryKey: [
        'balance',
        user.id,
        formatDateToQueryParam(date.from),
        formatDateToQueryParam(date.to),
      ],
    });
  }, [navigate, date, queryClient, user.id]);
  // 2. Quando eu recarregar a página, eu pego o from e to da url e persisto eles no state
  return <DatePickerWithRange value={date} onChange={setDate} />;
};

export default DateSelection;
