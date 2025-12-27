'use client';

import { useState, useEffect, useRef } from 'react';
import { destinationsApi, destinationsApiExtended } from '@/lib/api/services';
import type { Destination } from '@/types';

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [selectedDestinationForImage, setSelectedDestinationForImage] = useState<Destination | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newDestinationThumbnail, setNewDestinationThumbnail] = useState<File | null>(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'attraction',
    description: '',
    entry_fee: 0,
    transportation: '',
    latitude: 0,
    longitude: 0,
  });

  const destinationTypes = ['attraction', 'beach', 'mountain', 'cultural', 'entertainment', 'nature', 'historical'];

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationsApi.getAll();
      setDestinations(data);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate thumbnail for new destination
    if (!editingDestination && !newDestinationThumbnail) {
      alert('⚠️ Vui lòng chọn ảnh thumbnail cho điểm đến!');
      return;
    }
    
    try {
      if (editingDestination) {
        await destinationsApi.update(String(editingDestination.destination_id), formData);
      } else {
        // Create destination first
        const newDestination = await destinationsApi.create(formData);
        
        // Then upload thumbnail
        if (newDestinationThumbnail && newDestination.destination_id) {
          await destinationsApiExtended.uploadThumbnail(String(newDestination.destination_id), newDestinationThumbnail);
        }
      }
      setShowModal(false);
      setEditingDestination(null);
      resetForm();
      loadDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('❌ Có lỗi xảy ra khi lưu điểm đến. Vui lòng thử lại!');
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      location: destination.location,
      type: destination.type,
      description: destination.description,
      entry_fee: destination.entry_fee || 0,
      transportation: destination.transportation || '',
      latitude: destination.latitude || 0,
      longitude: destination.longitude || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa điểm đến này?')) {
      try {
        await destinationsApi.delete(String(id));
        loadDestinations();
      } catch (error) {
        console.error('Error deleting destination:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      type: 'attraction',
      description: '',
      entry_fee: 0,
      transportation: '',
      latitude: 0,
      longitude: 0,
    });
    setNewDestinationThumbnail(null);
    if (newThumbnailPreview) {
      URL.revokeObjectURL(newThumbnailPreview);
      setNewThumbnailPreview('');
    }
  };

  const handleThumbnailUpload = async (destinationId: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB!');
      return;
    }

    setUploadingThumbnail(true);
    try {
      await destinationsApiExtended.uploadThumbnail(String(destinationId), file);
      alert('✅ Tải thumbnail thành công!');
      loadDestinations();
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('❌ Có lỗi khi tải thumbnail. Vui lòng thử lại!');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 10) {
      alert('Tối đa 10 ảnh!');
      return;
    }

    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Vui lòng chỉ chọn file ảnh!');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Kích thước mỗi ảnh tối đa là 10MB!');
      return;
    }

    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleUploadImages = async () => {
    if (!selectedDestinationForImage || selectedImages.length === 0) {
      return;
    }

    setUploadingImages(true);
    try {
      for (const image of selectedImages) {
        await destinationsApiExtended.uploadImage(String(selectedDestinationForImage.destination_id), image);
      }
      alert('✅ Tải ảnh thành công!');
      setShowImageModal(false);
      setSelectedImages([]);
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setImagePreviews([]);
      setSelectedDestinationForImage(null);
      loadDestinations();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('❌ Có lỗi khi tải ảnh. Vui lòng thử lại!');
    } finally {
      setUploadingImages(false);
    }
  };

  const openImageModal = (destination: Destination) => {
    setSelectedDestinationForImage(destination);
    setShowImageModal(true);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const openAddModal = () => {
    setEditingDestination(null);
    resetForm();
    setShowModal(true);
  };

  const handleNewThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB!');
      return;
    }

    setNewDestinationThumbnail(file);
    if (newThumbnailPreview) {
      URL.revokeObjectURL(newThumbnailPreview);
    }
    setNewThumbnailPreview(URL.createObjectURL(file));
  };

  const filteredDestinations = destinations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || d.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      attraction: 'Điểm tham quan',
      beach: 'Bãi biển',
      mountain: 'Núi',
      cultural: 'Văn hóa',
      entertainment: 'Giải trí',
      nature: 'Thiên nhiên',
      historical: 'Lịch sử',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      attraction: 'bg-blue-100 text-blue-800',
      beach: 'bg-cyan-100 text-cyan-800',
      mountain: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      entertainment: 'bg-pink-100 text-pink-800',
      nature: 'bg-emerald-100 text-emerald-800',
      historical: 'bg-amber-100 text-amber-800',
    };
    return colors[type] || 'bg-gray-100 text-black';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Quản lý Điểm đến Du lịch</h1>
          <p className="text-black mt-1">Quản lý các điểm đến, địa điểm du lịch trong hệ thống</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm điểm đến mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{destinations.length}</div>
          <div className="text-sm text-black font-medium">Tổng số điểm đến</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {destinations.filter(d => d.type === 'beach').length}
          </div>
          <div className="text-sm text-black font-medium">Bãi biển</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {destinations.filter(d => d.type === 'cultural').length}
          </div>
          <div className="text-sm text-black font-medium">Văn hóa</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-amber-600">
            {destinations.filter(d => d.type === 'historical').length}
          </div>
          <div className="text-sm text-black font-medium">Lịch sử</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm điểm đến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="all">Tất cả loại</option>
            {destinationTypes.map(type => (
              <option key={type} value={type}>{getTypeLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider bg-gray-50">
                  Điểm đến
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider bg-gray-50">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider bg-gray-50">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider bg-gray-50">
                  Phí vào cửa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider bg-gray-50">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider bg-gray-50">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDestinations.map((destination) => (
                <tr key={destination.destination_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        {destination.thumbnail ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={destination.thumbnail}
                            alt={destination.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-black">{destination.name}</div>
                        <div className="text-sm text-black line-clamp-1 max-w-xs">{destination.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(destination.type)}`}>
                      {getTypeLabel(destination.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {destination.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {destination.entry_fee ? `${destination.entry_fee.toLocaleString('vi-VN')}₫` : 'Miễn phí'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm text-black font-medium">{destination.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(destination)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openImageModal(destination)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Quản lý hình ảnh"
                    >
                      🖼️
                    </button>
                    <button
                      onClick={() => handleDelete(destination.destination_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-black">Không có điểm đến nào</h3>
            <p className="mt-1 text-sm text-black">Bắt đầu bằng cách thêm điểm đến mới.</p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">
                  {editingDestination ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến mới'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-black hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Tên điểm đến *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Loại hình *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    {destinationTypes.map(type => (
                      <option key={type} value={type}>{getTypeLabel(type)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Vị trí *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ví dụ: Đà Nẵng, Việt Nam"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phí vào cửa (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phương tiện di chuyển</label>
                  <input
                    type="text"
                    value={formData.transportation}
                    onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                    placeholder="Ví dụ: Xe bus, Taxi, Máy bay"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Mô tả chi tiết về điểm đến..."
                  />
                </div>

                {/* Thumbnail Upload for New Destination */}
                {!editingDestination && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Ảnh đại diện (Thumbnail) *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewThumbnailSelect}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    />
                    <p className="text-sm text-black mt-1">Kích thước tối đa: 10MB. Ảnh đại diện là bắt buộc.</p>
                    
                    {newThumbnailPreview && (
                      <div className="mt-3">
                        <img
                          src={newThumbnailPreview}
                          alt="Preview"
                          className="h-32 w-48 object-cover rounded-lg border-2 border-blue-200"
                        />
                        <p className="text-sm text-black mt-1">Xem trước ảnh thumbnail</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-black"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDestination ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && selectedDestinationForImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">
                  Quản lý hình ảnh: {selectedDestinationForImage.name}
                </h2>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedDestinationForImage(null);
                    setSelectedImages([]);
                    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                    setImagePreviews([]);
                  }}
                  className="text-black hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Thumbnail Upload */}
              <div>
                <h3 className="text-lg font-bold text-black mb-3">Thumbnail (Ảnh đại diện)</h3>
                {selectedDestinationForImage.thumbnail && (
                  <div className="mb-3">
                    <img
                      src={selectedDestinationForImage.thumbnail}
                      alt="Current thumbnail"
                      className="h-32 w-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <p className="text-sm text-black mt-1">Thumbnail hiện tại</p>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleThumbnailUpload(selectedDestinationForImage.destination_id, file);
                    }
                  }}
                  className="hidden"
                  disabled={uploadingThumbnail}
                />
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {uploadingThumbnail ? '⏳ Đang tải lên...' : '📷 Tải lên Thumbnail mới'}
                </button>
                <p className="text-sm text-black mt-2">Kích thước tối đa: 10MB</p>
              </div>

              {/* Multiple Images Upload */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-black mb-3">Ảnh bổ sung (Gallery)</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      ref={imagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesSelect}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => imagesInputRef.current?.click()}
                        disabled={uploadingImages}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                      >
                        📷 Chọn ảnh
                      </button>
                      {selectedImages.length > 0 && (
                        <button
                          onClick={handleUploadImages}
                          disabled={uploadingImages}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {uploadingImages ? '⏳ Đang tải lên...' : `📤 Tải lên ${selectedImages.length} ảnh`}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-black mt-2">
                      Tối đa 10 ảnh, mỗi ảnh tối đa 10MB. Đã chọn: {selectedImages.length} ảnh
                    </p>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={uploadingImages}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {(selectedImages[index].size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedDestinationForImage(null);
                  setSelectedImages([]);
                  imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                  setImagePreviews([]);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
