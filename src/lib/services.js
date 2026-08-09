import { supabase } from './supabase';

export const authService = {
  async login(email, password, role) {
    console.log('Login attempt:', { email, role });
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .eq('role', role)
      .maybeSingle();

    console.log('Login result:', { data, error });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login gagal');
    }

    if (!data) {
      console.error('Login failed: no user found');
      throw new Error('Email, kata sandi, atau peran salah');
    }

    return data;
  },
};

export const userService = {
  async create(user) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const productService = {
  async getAll() {
    console.log('[productService.getAll] fetching products');
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        mitra:mitra_id (full_name),
        category:category_id (name),
        type:type_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[productService.getAll] error:', error);
      throw error;
    }
    console.log('[productService.getAll] result count:', data?.length || 0, 'products:', data?.map(p => ({ id: p.id, nama_produk: p.nama_produk, stock: p.stock })));
    return data || [];
  },

  async create(product) {
    console.log('[productService.create] payload:', product);
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('[productService.create] error:', error);
      throw error;
    }
    return data;
  },

  async update(id, product) {
    console.log('[productService.update] id:', id, 'payload:', product);
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[productService.update] error:', error);
      throw error;
    }
    console.log('[productService.update] result:', data);
    return data;
  },

  async decrementStock(id, qty) {
    const { data, error } = await supabase
      .rpc('decrement_product_stock', { p_product_id: id, p_qty: qty });

    if (error) {
      console.error('[productService.decrementStock] error:', error);
      throw error;
    }
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(name) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, name) {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const productTypeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(name) {
    const { data, error } = await supabase
      .from('product_types')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, name) {
    const { data, error } = await supabase
      .from('product_types')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('product_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const mitraService = {
  async getAll() {
    const { data, error } = await supabase
      .from('mitra')
      .select('*')
      .order('full_name');

    if (error) throw error;
    return data || [];
  },

  async create(mitra) {
    const { data, error } = await supabase
      .from('mitra')
      .insert([mitra])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, mitra) {
    const { data, error } = await supabase
      .from('mitra')
      .update(mitra)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('mitra')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('mitra')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const transactionService = {
  async create(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getHistory(filters = {}) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        mitra:mitra_id (full_name),
        items:transaction_items (
          *,
          product:product_id (nama_produk, sku, barcode_id, unit)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate + 'T23:59:59');
    if (filters.mitraId) query = query.eq('mitra_id', filters.mitraId);
    if (filters.paymentMethod) query = query.eq('metode_pembayaran', filters.paymentMethod);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        mitra:mitra_id (full_name),
        items:transaction_items (
          *,
          product:product_id (nama_produk, sku, barcode_id, unit)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

export const transactionItemService = {
  async create(item) {
    const { data, error } = await supabase
      .from('transaction_items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createBatch(items) {
    const { data, error } = await supabase
      .from('transaction_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data || [];
  },
};

export const stockMovementService = {
  async create(movement) {
    console.log('[stockMovementService.create] payload:', movement);
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([movement])
      .select('id, product_id, type, quantity, note, mitra_id, created_at')
      .single();

    if (error) {
      console.error('[stockMovementService.create] error:', error);
      throw error;
    }
    return data;
  },

  async getAll(filters = {}) {
    console.log('[stockMovementService.getAll] filters:', filters);
    let query = supabase
      .from('stock_movements')
      .select('id, product_id, type, quantity, note, mitra_id, created_at, product:product_id (nama_produk, unit), mitra:mitra_id (full_name)')
      .order('created_at', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.productId) query = query.eq('product_id', filters.productId);
    if (filters.mitraId) query = query.eq('mitra_id', filters.mitraId);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate + 'T23:59:59');

    const { data, error } = await query;

    if (error) {
      console.error('[stockMovementService.getAll] error:', error);
    }
    console.log('[stockMovementService.getAll] result count:', data?.length || 0);
    return data || [];
  },
};

export const pendingStockValidationService = {
  async create(validation) {
    const { data, error } = await supabase
      .from('pending_stock_validations')
      .insert([validation])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll(filters = {}) {
    let query = supabase
      .from('pending_stock_validations')
      .select(`
        *,
        mitra:mitra_id (full_name),
        product:product_id (nama_produk, unit)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (filters.mitraId) query = query.eq('mitra_id', filters.mitraId);
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getAllHistory(filters = {}) {
    let query = supabase
      .from('pending_stock_validations')
      .select(`
        *,
        mitra:mitra_id (full_name),
        product:product_id (nama_produk, unit)
      `)
      .order('created_at', { ascending: false });

    if (filters.mitraId) query = query.eq('mitra_id', filters.mitraId);
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async validate(id) {
    const { data, error } = await supabase
      .from('pending_stock_validations')
      .update({ status: 'validated' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const dashboardService = {
  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];

    const { count: totalTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (txError) throw txError;

    const { data: transactions, error: txDataError } = await supabase
      .from('transactions')
      .select('id, total')
      .gte('created_at', today);

    if (txDataError) throw txDataError;

    const totalSales = transactions?.reduce((sum, t) => sum + (t.total || 0), 0) || 0;

    const transactionIds = transactions?.map(t => t.id) || [];
    let totalItems = 0;

    if (transactionIds.length > 0) {
      const { count: itemCount } = await supabase
        .from('transaction_items')
        .select('*', { count: 'exact', head: true })
        .in('transaction_id', transactionIds);

      totalItems = itemCount || 0;
    }

    const { count: activeMitra, error: mitraError } = await supabase
      .from('mitra')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Aktif');

    if (mitraError) throw mitraError;

    return {
      totalTransactions: totalTransactions || 0,
      totalSales,
      totalItems,
      activeMitra: activeMitra || 0,
    };
  },
};

export const mitraSettlementService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('mitra_settlements')
      .select(`
        *,
        mitra:mitra_id (full_name),
        user:user_id (nama, email)
      `)
      .order('date', { ascending: false });

    if (filters.mitraId) query = query.eq('mitra_id', filters.mitraId);
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('mitra_settlements')
      .select(`
        *,
        mitra:mitra_id (full_name),
        user:user_id (nama, email),
        items:mitra_settlement_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(settlement) {
    const { data, error } = await supabase
      .from('mitra_settlements')
      .insert([settlement])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, settlement) {
    const { data, error } = await supabase
      .from('mitra_settlements')
      .update(settlement)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('mitra_settlements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
