import { useState, useEffect, useMemo } from 'react';
import { productService, categoryService, productTypeService, mitraService } from '../lib/services';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [mitraList, setMitraList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showMitraForm, setShowMitraForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [toast, setToast] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nama_produk: '',
    sku: '',
    category_id: '',
    type_id: '',
    mitra_id: '',
    mitra_price: '',
    selling_price: '',
    stock: '',
    unit: 'Pcs',
    photo: '',
    description: '',
    barcode_id: '',
  });
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState('');
  const [newMitra, setNewMitra] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editingType, setEditingType] = useState(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editingMitra, setEditingMitra] = useState(null);
  const [editMitraName, setEditMitraName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteTypeConfirm, setDeleteTypeConfirm] = useState(null);
  const [deleteMitraConfirm, setDeleteMitraConfirm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, typesData, mitraData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        productTypeService.getAll(),
        mitraService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setTypes(typesData);
      setMitraList(mitraData);
    } catch (error) {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeCategories = categories.filter(c => c.name && c.name !== 'Semua').length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode_id && product.barcode_id.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'Semua' || product.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return { label: 'Habis', class: 'bg-error-container/15 text-error border-error-container/30' };
    } else if (product.stock <= 10) {
      return { label: 'Stok Rendah', class: 'bg-[#fdf2d5] text-[#7a590c] border-[#ebd083]' };
    }
    return { label: 'Tersedia', class: 'bg-tertiary-fixed/15 text-tertiary-container border-tertiary-fixed/30' };
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const duplicateSku = products.find((p) => p.sku === formData.sku && p.id !== editingProduct?.id);
    const duplicateBarcode = formData.barcode_id && products.find((p) => p.barcode_id === formData.barcode_id && p.id !== editingProduct?.id);

    if (duplicateSku) {
      showToast('SKU sudah digunakan oleh produk lain', 'error');
      return;
    }

    if (duplicateBarcode) {
      showToast('Barcode ID sudah digunakan oleh produk lain', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, {
          nama_produk: formData.nama_produk,
          sku: formData.sku,
          category_id: formData.category_id || null,
          type_id: formData.type_id || null,
          mitra_id: formData.mitra_id || null,
          mitra_price: Number(formData.mitra_price),
          selling_price: Number(formData.selling_price),
          stock: Number(formData.stock),
          unit: formData.unit,
          photo: formData.photo,
          description: formData.description,
          barcode_id: formData.barcode_id,
        });
        showToast('Produk berhasil diperbarui!', 'success');
      } else {
        await productService.create({
          nama_produk: formData.nama_produk,
          sku: formData.sku,
          category_id: formData.category_id || null,
          type_id: formData.type_id || null,
          mitra_id: formData.mitra_id || null,
          mitra_price: Number(formData.mitra_price),
          selling_price: Number(formData.selling_price),
          stock: Number(formData.stock),
          unit: formData.unit,
          photo: formData.photo,
          description: formData.description,
          barcode_id: formData.barcode_id,
        });
        showToast('Produk berhasil ditambahkan!', 'success');
      }
      setFormData({
        nama_produk: '',
        sku: '',
        category_id: '',
        type_id: '',
        mitra_id: '',
        mitra_price: '',
        selling_price: '',
        stock: '',
        unit: 'Pcs',
        photo: '',
        description: '',
        barcode_id: '',
      });
      setShowForm(false);
      setEditingProduct(null);
      await loadData();
    } catch (error) {
      const detail = [error?.message, error?.details, error?.hint, error?.code].filter(Boolean).join(' | ') || 'Terjadi kesalahan saat menyimpan produk';
      showToast('Gagal menyimpan produk: ' + detail, 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nama_produk: product.nama_produk,
      sku: product.sku,
      category_id: product.category_id?.toString() || '',
      type_id: product.type_id?.toString() || '',
      mitra_id: product.mitra_id?.toString() || '',
      mitra_price: product.mitra_price.toString(),
      selling_price: product.selling_price.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
      photo: product.photo,
      description: product.description,
      barcode_id: product.barcode_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      showToast('Produk berhasil dihapus!', 'success');
    } catch (error) {
      showToast('Gagal menghapus produk', 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory && !categories.some(c => c.name === newCategory)) {
      try {
        await categoryService.create(newCategory);
        setNewCategory('');
        setShowCategoryForm(false);
        showToast('Kategori berhasil ditambahkan!', 'success');
        await loadData();
      } catch (error) {
        showToast('Gagal menambahkan kategori', 'error');
      }
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat);
  };

  const handleUpdateCategory = async () => {
    if (editCategoryName && editingCategory && editCategoryName !== editingCategory) {
      try {
        const catToUpdate = categories.find(c => c.name === editingCategory);
        if (catToUpdate) {
          await categoryService.update(catToUpdate.id, editCategoryName);
          showToast('Kategori berhasil diperbarui!', 'success');
          await loadData();
        }
      } catch (error) {
        showToast('Gagal memperbarui kategori', 'error');
      }
    }
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = async (cat) => {
    const catObj = categories.find(c => c.name === cat);
    if (!catObj) return;
    const productsInCategory = products.filter(p => p.category?.name === cat).length;
    if (productsInCategory > 0) {
      showToast(`Tidak dapat menghapus! Ada ${productsInCategory} produk di kategori ini.`, 'error');
      setDeleteConfirm(null);
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${cat}"?`)) {
      setDeleteConfirm(null);
      return;
    }
    try {
      await categoryService.delete(catObj.id);
      showToast('Kategori berhasil dihapus!', 'success');
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      showToast('Gagal menghapus kategori', 'error');
      setDeleteConfirm(null);
    }
  };

  const handleAddType = async () => {
    if (newType && !types.some(t => t.name === newType)) {
      try {
        await productTypeService.create(newType);
        setNewType('');
        setShowTypeForm(false);
        showToast('Jenis berhasil ditambahkan!', 'success');
        await loadData();
      } catch (error) {
        showToast('Gagal menambahkan jenis', 'error');
      }
    }
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setEditTypeName(type);
  };

  const handleUpdateType = async () => {
    if (editTypeName && editingType && editTypeName !== editingType) {
      try {
        const typeToUpdate = types.find(t => t.name === editingType);
        if (typeToUpdate) {
          await productTypeService.update(typeToUpdate.id, editTypeName);
          showToast('Jenis berhasil diperbarui!', 'success');
          await loadData();
        }
      } catch (error) {
        showToast('Gagal memperbarui jenis', 'error');
      }
    }
    setEditingType(null);
    setEditTypeName('');
  };

  const handleDeleteType = async (type) => {
    const typeObj = types.find(t => t.name === type);
    if (!typeObj) return;
    const productsInType = products.filter(p => p.type?.name === type).length;
    if (productsInType > 0) {
      showToast(`Tidak dapat menghapus! Ada ${productsInType} produk dengan jenis ini.`, 'error');
      setDeleteTypeConfirm(null);
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jenis "${type}"?`)) {
      setDeleteTypeConfirm(null);
      return;
    }
    try {
      await productTypeService.delete(typeObj.id);
      showToast('Jenis berhasil dihapus!', 'success');
      setDeleteTypeConfirm(null);
      await loadData();
    } catch (error) {
      showToast('Gagal menghapus jenis', 'error');
      setDeleteTypeConfirm(null);
    }
  };

  const handleAddMitra = async () => {
    if (newMitra && !mitraList.some(m => m.full_name === newMitra)) {
      try {
        await mitraService.create({
          full_name: newMitra,
          address: '',
          phone: '',
          email: '',
          gender: 'Laki-laki',
          photo: '',
          status: 'Aktif',
          total_transaction: 0,
          total_omzet: 0,
        });
        setNewMitra('');
        setShowMitraForm(false);
        showToast('Mitra berhasil ditambahkan!', 'success');
        await loadData();
      } catch (error) {
        showToast('Gagal menambahkan mitra', 'error');
      }
    }
  };

  const handleEditMitra = (mitra) => {
    setEditingMitra(mitra.id);
    setEditMitraName(mitra.full_name);
  };

  const handleUpdateMitra = async () => {
    if (editMitraName && editingMitra && editMitraName !== mitraList.find(m => m.id === editingMitra)?.full_name) {
      try {
        await mitraService.update(editingMitra, {
          full_name: editMitraName,
        });
        showToast('Mitra berhasil diperbarui!', 'success');
        setEditingMitra(null);
        setEditMitraName('');
        await loadData();
      } catch (error) {
        showToast('Gagal memperbarui mitra', 'error');
        setEditingMitra(null);
        setEditMitraName('');
      }
    } else {
      setEditingMitra(null);
      setEditMitraName('');
    }
  };

  const handleDeleteMitra = async (mitra) => {
    const productsInMitra = products.filter(p => p.mitra_id === mitra.id).length;
    if (productsInMitra > 0) {
      showToast(`Tidak dapat menghapus! Ada ${productsInMitra} produk milik mitra ini.`, 'error');
      setDeleteMitraConfirm(null);
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus mitra "${mitra.full_name}"?`)) {
      setDeleteMitraConfirm(null);
      return;
    }
    try {
      await mitraService.delete(mitra.id);
      showToast('Mitra berhasil dihapus!', 'success');
      setDeleteMitraConfirm(null);
      await loadData();
    } catch (error) {
      showToast('Gagal menghapus mitra', 'error');
      setDeleteMitraConfirm(null);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_produk: '',
      sku: '',
      category_id: '',
      type_id: '',
      mitra_id: '',
      mitra_price: '',
      selling_price: '',
      stock: '',
      unit: 'Pcs',
      photo: '',
      description: '',
      barcode_id: '',
    });
    setEditingProduct(null);
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setEditingProduct(null);
    } else {
      resetForm();
      setShowForm(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full relative z-0 h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            {/* Page Header */}
            <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Product Management</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Kelola katalog produk dan inventori
                </p>
              </div>
              <button
                onClick={toggleForm}
                className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl flex items-center gap-2 transition-all duration-200 font-label-md text-label-md shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined">add</span>
                {showForm ? 'Batal' : 'Tambah Produk'}
              </button>
            </header>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between">
              <div>
                <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Produk</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Kelola katalog produk</p>
              </div>
              <button
                onClick={toggleForm}
                aria-label={showForm ? 'Batal' : 'Tambah Produk'}
                className="h-10 w-10 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Total</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Produk</p>
                  <p className="font-display-lg text-display-lg text-on-background tracking-tight">{totalProducts}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                    <span className="material-symbols-outlined">category</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Aktif</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Kategori</p>
                  <p className="font-display-lg text-display-lg text-on-background tracking-tight">{activeCategories}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#fdf2d5] flex items-center justify-center text-[#7a590c]">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-[#7a590c] bg-[#fdf2d5]/50 px-2 py-1 rounded-full">Perhatian</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Stok Menipis</p>
                  <p className="font-display-lg text-display-lg text-on-background tracking-tight">{lowStock}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">remove_circle</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-error bg-error-container/20 px-2 py-1 rounded-full">Kritis</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Stok Habis</p>
                  <p className="font-display-lg text-display-lg text-on-background tracking-tight">{outOfStock}</p>
                </div>
              </div>
            </div>

            {/* Add/Edit Product Form */}
            {showForm && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-outline-variant/50 bg-surface flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined">{editingProduct ? 'edit' : 'add_circle'}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-background">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{editingProduct ? 'Perbarui data produk' : 'Isi data produk dengan lengkap'}</p>
                  </div>
                </div>
                <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Produk */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="name">
                        Nama Produk <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="name"
                          type="text"
                          placeholder="Masukkan nama produk"
                          value={formData.nama_produk}
                          onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* SKU */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="sku">
                        SKU <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">qr_code</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="sku"
                          type="text"
                          placeholder="Contoh: BRP-001"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="category">
                        Kategori <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">category</span>
                        </div>
                        <select
                          className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background appearance-none cursor-pointer"
                          id="category"
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        >
                          <option value="">Pilih Kategori</option>
                          {categories.filter(c => c.name !== 'Semua').map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                        </div>
                      </div>
                    </div>

                    {/* Jenis */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="type">
                        Jenis <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">nutrition</span>
                        </div>
                        <select
                          className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background appearance-none cursor-pointer"
                          id="type"
                          value={formData.type_id}
                          onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                        >
                          <option value="">Pilih Jenis</option>
                          {types.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                        </div>
                      </div>
                    </div>

                    {/* Nama Mitra */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="mitraName">
                        Nama Mitra <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <select
                          className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background appearance-none cursor-pointer"
                          id="mitraName"
                          value={formData.mitra_id}
                          onChange={(e) => setFormData({ ...formData, mitra_id: e.target.value })}
                          required
                        >
                          <option value="">Pilih Mitra</option>
                          {mitraList.map(mitra => (
                            <option key={mitra.id} value={mitra.id}>{mitra.full_name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                        </div>
                      </div>
                    </div>

                    {/* Harga Mitra */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="mitraPrice">
                        Harga Mitra (Rp) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="mitraPrice"
                          type="number"
                          placeholder="0"
                          value={formData.mitra_price}
                          onChange={(e) => setFormData({ ...formData, mitra_price: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Harga Jual */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="sellingPrice">
                        Harga Jual (Rp) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">payments</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="sellingPrice"
                          type="number"
                          placeholder="0"
                          value={formData.selling_price}
                          onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Stok */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="stock">
                        Stok <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">inventory</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="stock"
                          type="number"
                          placeholder="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Satuan */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="unit">
                        Satuan <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">straighten</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="unit"
                          type="text"
                          placeholder="Contoh: Pcs, Pack, Gelas"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                     {/* Barcode ID */}
                     <div className="space-y-2">
                       <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="barcode">
                         Barcode ID
                       </label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                           <span className="material-symbols-outlined text-[20px]">barcode</span>
                         </div>
                         <input
                           className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                           id="barcode"
                           type="text"
                           placeholder="Scan atau masukkan barcode"
                           value={formData.barcode_id}
                           onChange={(e) => setFormData({ ...formData, barcode_id: e.target.value })}
                         />
                       </div>
                     </div>

                     {/* Foto Produk */}
                     <div className="space-y-2">
                       <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="photo">
                         Foto Produk
                       </label>
                       <div className="flex items-center gap-4">
                         <div className="w-20 h-20 rounded-lg bg-surface-container border border-outline-variant overflow-hidden flex items-center justify-center">
                           {formData.photo ? (
                             <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                             <span className="material-symbols-outlined text-outline text-3xl">image</span>
                           )}
                         </div>
                         <div className="flex-1">
                           <input
                             id="photo"
                             type="file"
                             accept="image/*"
                             onChange={handlePhotoChange}
                             className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-fixed-variant"
                           />
                           <p className="text-xs text-on-surface-variant mt-1">Format: JPG, PNG. Maksimal 2MB.</p>
                         </div>
                       </div>
                     </div>
                   </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="h-12 px-6 rounded-xl border border-outline text-on-surface font-label-md hover:bg-surface-container transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl font-label-md shadow-sm transition-all"
                    >
                      {editingProduct ? 'Perbarui Produk' : 'Simpan Produk'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Product List Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-outline-variant/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Produk</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Kelola dan pantau semua produk</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-outline bg-surface-container-low text-on-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-outline bg-surface-container-low text-on-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm cursor-pointer"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.name || cat}>{cat.name || cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4">Mitra</th>
                      <th className="py-3 px-4">Harga Mitra</th>
                      <th className="py-3 px-4">Harga Jual</th>
                      <th className="py-3 px-4">Stok</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50 text-sm">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-8 text-on-surface-variant">
                          Tidak ada produk yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const badge = getStatusBadge(product);
                        return (
                          <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant">
                                {product.photo ? (
                                  <img src={product.photo} alt={product.nama_produk} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-outline">image</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-on-background">{product.nama_produk}</p>
                                <p className="text-xs text-on-surface-variant truncate max-w-[150px]">{product.description || '-'}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">{product.sku}</td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-surface-container-high text-on-surface-variant">
                                {product.category?.name || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-surface-container-high text-on-surface-variant">
                                {product.type?.name || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-on-surface-variant">{product.mitra?.full_name || '-'}</td>
                            <td className="py-3 px-4 font-medium text-on-background">
                              Rp {Number(product.mitra_price).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 font-medium text-primary">
                              Rp {Number(product.selling_price).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-on-background">{product.stock}</span>
                              <span className="block text-xs text-on-surface-variant">{product.unit}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs border ${badge.class}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="w-8 h-8 rounded-lg bg-secondary-container/50 hover:bg-secondary-container text-on-secondary-container flex items-center justify-center transition-all"
                                  title="Edit"
                                  aria-label="Edit produk"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="w-8 h-8 rounded-lg bg-error-container/30 hover:bg-error-container/50 text-error flex items-center justify-center transition-all"
                                  title="Hapus"
                                  aria-label="Hapus produk"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2 animate-bounce ${
          toast.type === 'error' 
            ? 'bg-error-container text-error border-error/30' 
            : 'bg-surface-container-high text-on-background border-outline-variant'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ProductManagement;