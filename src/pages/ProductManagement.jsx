import { useState, useEffect } from 'react';
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
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeCategories = categories.filter(c => c !== 'Semua').length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode_id && product.barcode_id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Semua' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, {
          nama_produk: formData.nama_produk,
          sku: formData.sku,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          type_id: formData.type_id ? Number(formData.type_id) : null,
          mitra_id: formData.mitra_id ? Number(formData.mitra_id) : null,
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
          category_id: formData.category_id ? Number(formData.category_id) : null,
          type_id: formData.type_id ? Number(formData.type_id) : null,
          mitra_id: formData.mitra_id ? Number(formData.mitra_id) : null,
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
      console.error('Failed to save product:', error);
      showToast('Gagal menyimpan produk', 'error');
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
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      showToast('Produk berhasil dihapus!', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
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
        console.error('Failed to add category:', error);
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
        console.error('Failed to update category:', error);
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
    try {
      await categoryService.delete(catObj.id);
      showToast('Kategori berhasil dihapus!', 'success');
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete category:', error);
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
        console.error('Failed to add type:', error);
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
        console.error('Failed to update type:', error);
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
    try {
      await productTypeService.delete(typeObj.id);
      showToast('Jenis berhasil dihapus!', 'success');
      setDeleteTypeConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete type:', error);
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
        console.error('Failed to add mitra:', error);
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
        console.error('Failed to update mitra:', error);
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
    try {
      await mitraService.delete(mitra.id);
      showToast('Mitra berhasil dihapus!', 'success');
      setDeleteMitraConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete mitra:', error);
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
    <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
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
                        <select
                          className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background appearance-none cursor-pointer"
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Sak">Sak</option>
                          <option value="Botol">Botol</option>
                          <option value="Karton">Karton</option>
                          <option value="Kepul">Kepul</option>
                          <option value="Gelas">Gelas</option>
                          <option value="Pack">Pack</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                        </div>
                      </div>
                    </div>

                    {/* ID Barcode */}
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="barcodeId">
                        ID Barcode <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">barcode</span>
                        </div>
                        <input
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                          id="barcodeId"
                          type="text"
                          placeholder="Contoh: BC-001"
                          value={formData.barcode_id}
                          onChange={(e) => setFormData({ ...formData, barcode_id: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="description">
                        Deskripsi
                      </label>
                      <textarea
                        className="w-full h-24 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70 resize-none"
                        id="description"
                        placeholder="Deskripsi produk (opsional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Foto Produk */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="photo">
                        Foto Produk
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-xl bg-surface-container overflow-hidden border-2 border-outline-variant flex items-center justify-center flex-shrink-0 shadow-sm">
                          {formData.photo ? (
                            <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-outline text-4xl">image</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            className="w-full h-12 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-fixed-variant"
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                          />
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">Format: JPG, PNG. Maksimal 2MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
                    <button
                      type="submit"
                      className="h-12 px-8 bg-secondary-fixed-dim hover:bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined">save</span>
                      {editingProduct ? 'Perbarui' : 'Simpan Produk'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingProduct(null); }}
                      className="h-12 px-8 bg-surface border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-xl hover:bg-surface-container transition-all duration-200"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Category, Type, and Mitra Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Management */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">folder</span>
                    Kategori
                  </h3>
                  {!showCategoryForm && (
                    <button
                      onClick={() => setShowCategoryForm(true)}
                      className="h-8 w-8 bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  )}
                </div>
                {showCategoryForm && (
                  <div className="flex gap-2 mb-4">
                    <input
                      className="flex-1 h-10 rounded-lg border border-outline bg-transparent px-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Kategori baru"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button
                      onClick={handleAddCategory}
                      className="h-10 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => { setShowCategoryForm(false); setNewCategory(''); }}
                      className="h-10 px-4 bg-surface border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c.name !== 'Semua').map(cat => (
                    <div key={cat.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-full font-label-sm text-label-sm text-on-surface">
                      {editingCategory === cat.name ? (
                        <>
                          <input
                            className="w-20 h-6 bg-transparent border-b border-primary outline-none text-center font-label-sm text-label-sm"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateCategory();
                              if (e.key === 'Escape') { setEditingCategory(null); setEditCategoryName(''); }
                            }}
                          />
                          <button onClick={handleUpdateCategory} className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          </button>
                          <button onClick={() => { setEditingCategory(null); setEditCategoryName(''); }} className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-error hover:text-on-error">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{cat.name}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <button onClick={() => handleEditCategory(cat.name)} className="w-5 h-5 rounded-full hover:bg-primary/10 flex items-center justify-center text-on-surface-variant hover:text-primary">
                              <span className="material-symbols-outlined text-[12px]">edit</span>
                            </button>
                            <button onClick={() => setDeleteConfirm(cat.name)} className="w-5 h-5 rounded-full hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error">
                              <span className="material-symbols-outlined text-[12px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Management */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">nutrition</span>
                    Jenis
                  </h3>
                  {!showTypeForm && (
                    <button
                      onClick={() => setShowTypeForm(true)}
                      className="h-8 w-8 bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  )}
                </div>
                {showTypeForm && (
                  <div className="flex gap-2 mb-4">
                    <input
                      className="flex-1 h-10 rounded-lg border border-outline bg-transparent px-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Jenis baru"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                    />
                    <button
                      onClick={handleAddType}
                      className="h-10 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => { setShowTypeForm(false); setNewType(''); }}
                      className="h-10 px-4 bg-surface border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {types.map(type => (
                    <div key={type.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-full font-label-sm text-label-sm text-on-surface">
                      {editingType === type.name ? (
                        <>
                          <input
                            className="w-20 h-6 bg-transparent border-b border-primary outline-none text-center font-label-sm text-label-sm"
                            value={editTypeName}
                            onChange={(e) => setEditTypeName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateType();
                              if (e.key === 'Escape') { setEditingType(null); setEditTypeName(''); }
                            }}
                          />
                          <button onClick={handleUpdateType} className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          </button>
                          <button onClick={() => { setEditingType(null); setEditTypeName(''); }} className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-error hover:text-on-error">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{type.name}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <button onClick={() => handleEditType(type.name)} className="w-5 h-5 rounded-full hover:bg-primary/10 flex items-center justify-center text-on-surface-variant hover:text-primary">
                              <span className="material-symbols-outlined text-[12px]">edit</span>
                            </button>
                            <button onClick={() => setDeleteTypeConfirm(type.name)} className="w-5 h-5 rounded-full hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error">
                              <span className="material-symbols-outlined text-[12px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitra Management */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">people</span>
                    Mitra
                  </h3>
                  {!showMitraForm && (
                    <button
                      onClick={() => setShowMitraForm(true)}
                      className="h-8 w-8 bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  )}
                </div>
                {showMitraForm && (
                  <div className="flex gap-2 mb-4">
                    <input
                      className="flex-1 h-10 rounded-lg border border-outline bg-transparent px-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Nama mitra"
                      value={newMitra}
                      onChange={(e) => setNewMitra(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMitra()}
                    />
                    <button
                      onClick={handleAddMitra}
                      className="h-10 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => { setShowMitraForm(false); setNewMitra(''); }}
                      className="h-10 px-4 bg-surface border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {mitraList.map(mitra => (
                    <div key={mitra.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-full font-label-sm text-label-sm text-on-surface">
                      {editingMitra === mitra.id ? (
                        <>
                          <input
                            className="w-20 h-6 bg-transparent border-b border-primary outline-none text-center font-label-sm text-label-sm"
                            value={editMitraName}
                            onChange={(e) => setEditMitraName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateMitra();
                              if (e.key === 'Escape') { setEditingMitra(null); setEditMitraName(''); }
                            }}
                          />
                          <button onClick={handleUpdateMitra} className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          </button>
                          <button onClick={() => { setEditingMitra(null); setEditMitraName(''); }} className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-error hover:text-on-error">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{mitra.full_name}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <button onClick={() => handleEditMitra(mitra)} className="w-5 h-5 rounded-full hover:bg-primary/10 flex items-center justify-center text-on-surface-variant hover:text-primary">
                              <span className="material-symbols-outlined text-[12px]">edit</span>
                            </button>
                            <button onClick={() => setDeleteMitraConfirm(mitra)} className="w-5 h-5 rounded-full hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error">
                              <span className="material-symbols-outlined text-[12px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delete Confirmation Dialogs */}
            {deleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 max-w-sm w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-background">Hapus Kategori</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Konfirmasi penghapusan</p>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-6">
                    Apakah Anda yakin ingin menghapus kategori <strong>"{deleteConfirm}"</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteCategory(deleteConfirm)}
                      className="flex-1 h-12 bg-error text-on-error rounded-xl font-label-md text-label-md hover:bg-error/90 transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 h-12 bg-surface border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteTypeConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 max-w-sm w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-background">Hapus Jenis</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Konfirmasi penghapusan</p>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-6">
                    Apakah Anda yakin ingin menghapus jenis <strong>"{deleteTypeConfirm}"</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteType(deleteTypeConfirm)}
                      className="flex-1 h-12 bg-error text-on-error rounded-xl font-label-md text-label-md hover:bg-error/90 transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setDeleteTypeConfirm(null)}
                      className="flex-1 h-12 bg-surface border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteMitraConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 max-w-sm w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-background">Hapus Mitra</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Konfirmasi penghapusan</p>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-6">
                    Apakah Anda yakin ingin menghapus mitra <strong>"{deleteMitraConfirm.full_name}"</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteMitra(deleteMitraConfirm)}
                      className="flex-1 h-12 bg-error text-on-error rounded-xl font-label-md text-label-md hover:bg-error/90 transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setDeleteMitraConfirm(null)}
                      className="flex-1 h-12 bg-surface border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Produk</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Kelola dan pantau semua produk</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input
                      className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-lg border border-outline bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md transition-all placeholder:text-outline/70"
                      placeholder="Cari produk..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-10 px-4 rounded-lg border border-outline bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="Semua">Semua Kategori</option>
                    {categories.filter(c => c.name !== 'Semua').map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-outline mb-3">inventory_2</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada produk yang ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '7%' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">SKU</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Kategori</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Jenis</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Harga Mitra</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Harga Jual</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stok</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                      {filteredProducts.map((product, idx) => {
                        const status = getStatusBadge(product);
                        return (
                          <tr
                            key={product.id}
                            className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden border border-outline-variant flex-shrink-0 shadow-sm">
                                  {product.photo ? (
                                    <img src={product.photo} alt={product.nama_produk} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-outline">
                                      <span className="material-symbols-outlined text-2xl">image</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-on-surface text-base">{product.nama_produk}</div>
                                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">{product.sku}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                                {product.category?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                                {product.type?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{product.mitra?.full_name}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-numeric-data text-numeric-data text-on-surface-variant">Rp {product.mitra_price.toLocaleString('id-ID')}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-numeric-data text-numeric-data text-primary font-semibold">Rp {product.selling_price.toLocaleString('id-ID')}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-numeric-data text-numeric-data text-on-background">{product.stock} {product.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-sm border ${status.class}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-all duration-200"
                                  title="Edit"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="w-8 h-8 rounded-lg bg-error-container/20 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-all duration-200"
                                  title="Hapus"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Menampilkan {filteredProducts.length} dari {products.length} produk
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-label-md text-label-md">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
