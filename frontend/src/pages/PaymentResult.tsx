import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader, Clock } from 'lucide-react';
import { getPaymentStatus, PaymentStatusResponse } from '../services/paymentApi';

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 3000;

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const cancelled = searchParams.get('cancel') === 'true' || searchParams.get('status') === 'CANCELLED';

  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [state, setState] = useState<'checking' | 'paid' | 'cancelled' | 'pending' | 'error'>('checking');
  const pollCount = useRef(0);

  useEffect(() => {
    if (!orderCode) {
      setState('error');
      return;
    }

    let timer: number | undefined;
    let stopped = false;

    const check = async () => {
      try {
        const res = await getPaymentStatus(orderCode);
        if (stopped) return;
        const data = res.data;
        setPayment(data);

        if (data.status === 'paid') {
          setState('paid');
          return;
        }
        if (data.status === 'cancelled' || cancelled) {
          setState('cancelled');
          return;
        }

        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setState('pending');
          return;
        }
        setState('checking');
        timer = window.setTimeout(check, POLL_INTERVAL_MS);
      } catch {
        if (!stopped) setState('error');
      }
    };

    check();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderCode, cancelled]);

  const goBack = () => {
    if (payment?.type === 'subscription') {
      navigate('/vendor/dashboard');
    } else {
      navigate('/my-bookings');
    }
  };

  const backLabel = payment?.type === 'subscription' ? 'Về Dashboard' : 'Xem đơn của tôi';

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="glass-panel rounded-3xl border border-white/10 p-10 max-w-md w-full text-center space-y-6">
        {state === 'checking' && (
          <>
            <Loader className="w-16 h-16 text-cyan mx-auto animate-spin" />
            <h1 className="text-2xl font-bold text-white">Đang xác nhận thanh toán...</h1>
            <p className="text-slate-400 text-sm">Vui lòng chờ trong giây lát, hệ thống đang xác nhận giao dịch với PayOS.</p>
          </>
        )}

        {state === 'paid' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Thanh toán thành công!</h1>
            {payment && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 space-y-2 text-left">
                <div className="flex justify-between">
                  <span>Mã giao dịch</span>
                  <span className="font-mono text-white">{payment.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền</span>
                  <span className="font-semibold text-emerald-400">{formatVND(payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loại giao dịch</span>
                  <span className="text-white">
                    {payment.type === 'booking_deposit' && 'Thanh toán cọc'}
                    {payment.type === 'booking_final' && 'Thanh toán phần còn lại'}
                    {payment.type === 'subscription' && 'Nâng cấp gói dịch vụ'}
                  </span>
                </div>
              </div>
            )}
            <p className="text-slate-400 text-sm">
              {payment?.type === 'subscription'
                ? 'Gói dịch vụ của bạn đã được kích hoạt.'
                : 'Đơn đặt lịch của bạn đã được cập nhật.'}
            </p>
          </>
        )}

        {state === 'cancelled' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Thanh toán đã bị hủy</h1>
            <p className="text-slate-400 text-sm">Bạn đã hủy giao dịch hoặc giao dịch đã hết hạn. Bạn có thể thử thanh toán lại bất cứ lúc nào.</p>
          </>
        )}

        {state === 'pending' && (
          <>
            <Clock className="w-16 h-16 text-amber-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Đang chờ xác nhận</h1>
            <p className="text-slate-400 text-sm">
              Giao dịch chưa được xác nhận. Nếu bạn đã thanh toán, hệ thống sẽ tự động cập nhật khi nhận được thông báo từ PayOS.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Không thể kiểm tra giao dịch</h1>
            <p className="text-slate-400 text-sm">Thiếu mã giao dịch hoặc có lỗi xảy ra. Vui lòng kiểm tra lại đơn của bạn.</p>
          </>
        )}

        {state !== 'checking' && (
          <button
            onClick={goBack}
            className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all cyan-glow"
          >
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
}
