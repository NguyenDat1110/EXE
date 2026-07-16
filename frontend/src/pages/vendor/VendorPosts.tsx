import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image, Trash2, X, Loader2, Calendar, Edit3, CheckCircle } from 'lucide-react';
import { createPost, getMyPosts, deletePost, updatePost, Post } from '../../services/postApi';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

const BASE_URL = 'http://localhost:5000';

const EVENT_TYPES = [
  'Tiệc sinh nhật',
  'Tiệc công ty',
  'Sự kiện khác',
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function VendorPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventType, setEventType] = useState('');

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const openLightbox = (images: string[], index: number) => setLightbox({ images: images.map((img) => `${BASE_URL}${img}`), index });
  const closeLightbox = () => setLightbox(null);
  const showPrevLightbox = () => setLightbox((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev));
  const showNextLightbox = () => setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev));

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getMyPosts();
      setPosts(data.posts);
    } catch {
      setError('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = files.length + selectedFiles.length;
    if (total > 10) {
      setError('Tối đa 10 ảnh cho mỗi bài viết');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEventType('');
    setExistingImages([]);
    setSelectedFiles([]);
    setNewPreviews([]);
    setEditingPost(null);
    setError('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền tiêu đề và nội dung');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingPost) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        if (eventType) formData.append('eventType', eventType);
        formData.append('keepImages', JSON.stringify(existingImages));
        selectedFiles.forEach((file) => formData.append('images', file));
        await updatePost(editingPost._id, formData);
        setSuccess('Cập nhật bài viết thành công!');
      } else {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        if (eventType) formData.append('eventType', eventType);
        selectedFiles.forEach((file) => formData.append('images', file));
        await createPost(formData);
        setSuccess('Đăng bài thành công!');
      }
      resetForm();
      fetchPosts();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Không thể đăng bài. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setEventType(post.eventType || '');
    setExistingImages(post.images || []);
    setSelectedFiles([]);
    setNewPreviews([]);
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setSuccess('Đã xóa bài viết');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Không thể xóa bài viết');
    }
  };

  const totalImages = existingImages.length + selectedFiles.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bài Viết Của Tôi</h1>
          <p className="text-silver text-sm">Chia sẻ sự kiện và kết nối với khách hàng</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan text-navy rounded-xl font-semibold text-sm hover:bg-cyan/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Đăng Bài Mới
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-cyan/10 border border-cyan/30 rounded-xl text-cyan text-sm">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan" />
                {editingPost ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-white/5 text-silver hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-silver mb-2">Loại sự kiện</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan/50"
                >
                  <option value="">-- Chọn loại sự kiện --</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-navy">{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-silver mb-2">Tiêu đề <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Sự kiện sinh nhật đặc biệt tháng 6..."
                  maxLength={200}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-silver mb-2">Nội dung <span className="text-red-400">*</span></label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Mô tả sự kiện, không khí, những điểm đặc biệt..."
                  maxLength={2000}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan/50 resize-none"
                />
                <p className="text-right text-xs text-white/30 mt-1">{content.length}/2000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-silver mb-2">
                  Ảnh sự kiện ({totalImages}/10)
                </label>

                {editingPost && existingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {existingImages.map((src, i) => (
                      <div key={`old-${i}`} className="relative group aspect-square">
                        <img src={`${BASE_URL}${src}`} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {newPreviews.map((src, i) => (
                      <div key={`new-${i}`} className="relative group aspect-square">
                        <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center cursor-pointer hover:border-cyan/40 hover:bg-cyan/5 transition-colors"
                >
                  <Image className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/50">Nhấn để chọn ảnh</p>
                  <p className="text-xs text-white/30 mt-1">JPG, PNG, WEBP — tối đa 10MB/ảnh</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-silver hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cyan text-navy rounded-xl font-semibold text-sm hover:bg-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {editingPost ? 'Đang cập nhật...' : 'Đang đăng...'}</>
                  ) : editingPost ? 'Cập Nhật' : 'Đăng Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <Edit3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg">Chưa có bài viết nào</p>
          <p className="text-white/30 text-sm mt-1">Hãy chia sẻ sự kiện đầu tiên của bạn!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <div key={post._id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {post.eventType && (
                    <span className="inline-block px-2.5 py-0.5 bg-cyan/10 border border-cyan/20 text-cyan text-xs rounded-full mb-2">
                      {post.eventType}
                    </span>
                  )}
                  <h3 className="font-semibold text-white text-base">{post.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-white/40">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 text-white/30 hover:text-cyan hover:bg-cyan/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-silver text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

              {post.images.length > 0 && (
                <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {post.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(post.images, i)}
                      className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-cyan/40 transition-colors"
                    >
                      <img
                        src={`${BASE_URL}${img}`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onPrev={showPrevLightbox}
          onNext={showNextLightbox}
        />
      )}
    </div>
  );
}
