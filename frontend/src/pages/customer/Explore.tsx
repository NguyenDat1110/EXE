import React from 'react';
import { Compass } from 'lucide-react';

export default function Explore() {
  const categories = [
    { title: 'Tiệc Cưới', count: 120, img: 'https://images.unsplash.com/photo-1519671482677-504be0ffbc87?w=300&q=80' },
    { title: 'Hội Thảo', count: 85, img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&q=80' },
    { title: 'Sinh Nhật', count: 94, img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&q=80' },
    { title: 'Kỷ Niệm', count: 62, img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&q=80' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-serif italic text-white flex items-center gap-3">
          <Compass className="w-8 h-8 text-cyan" />
          Customer Explore
        </h1>
        <p className="text-silver/60 mt-2 text-lg">Tìm kiếm và lựa chọn các gói dịch vụ sự kiện hoàn hảo nhất cho bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <div key={i} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-cyan/50 transition-all duration-300">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${cat.img})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs bg-cyan/20 border border-cyan/40 text-cyan px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">{cat.count} gói</span>
              <h3 className="text-xl font-bold font-manrope text-white mt-2 group-hover:text-cyan transition-colors">{cat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Trang Customer Explore</h2>
        <p className="text-silver/70 leading-relaxed">
          Giao diện dành riêng cho khách hàng đã đăng nhập (hoặc khách vãng lai). Cho phép duyệt qua các chuyên mục sự kiện khác nhau, 
          lọc theo địa điểm và mức giá, rồi đi đến chi tiết của các Vendor để đặt chỗ.
        </p>
      </div>
    </div>
  );
}
