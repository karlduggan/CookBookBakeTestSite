import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';
import { successResponse, errorResponse, validationError, unauthorizedError, notFoundError, serverError } from '../../../lib/api-utils/response.js';

// GET /api/admin/categories - Get all categories
// POST /api/admin/categories - Create category
// PUT /api/admin/categories/:id - Update category
// DELETE /api/admin/categories/:id - Delete category

export async function GET(context) {
  return handleRequest(context, 'GET');
}

export async function POST(context) {
  return handleRequest(context, 'POST');
}

export async function PUT(context) {
  return handleRequest(context, 'PUT');
}

export async function DELETE(context) {
  return handleRequest(context, 'DELETE');
}

async function handleRequest(context, method) {
  try {
    const { isAuthenticated, user, error: authError } = authenticateRequest(context.request.headers);

    if (!isAuthenticated || !user) {
      return unauthorizedError('Unauthorized');
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return forbiddenError('Admin access required');
    }

    const supabase = createSupabaseClient();
    const url = new URL(context.request.url);
    const categoryId = url.searchParams.get('id');

    if (method === 'GET') {
      return await getAllCategories(supabase);
    } else if (method === 'POST') {
      return await createCategory(context, supabase);
    } else if (method === 'PUT' && categoryId) {
      return await updateCategory(context, supabase, categoryId);
    } else if (method === 'DELETE' && categoryId) {
      return await deleteCategory(supabase, categoryId);
    }

    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
  } catch (error) {
    console.error('Admin categories error:', error);
    return serverError(error);
  }
}

async function getAllCategories(supabase) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, display_order')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    console.error('Get all categories error:', error);
    return serverError(error);
  }
}

async function createCategory(context, supabase) {
  try {
    const body = await context.request.json();

    if (!body.name || !body.slug) {
      return validationError('Name and slug are required');
    }

    // Check if slug already exists
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existing) {
      return validationError('Slug already exists');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        display_order: body.display_order || 999,
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data, 201);
  } catch (error) {
    console.error('Create category error:', error);
    return serverError(error);
  }
}

async function updateCategory(context, supabase, categoryId) {
  try {
    const body = await context.request.json();

    // Check if category exists
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (!existing || checkError) {
      return notFoundError('Category not found');
    }

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    console.error('Update category error:', error);
    return serverError(error);
  }
}

async function deleteCategory(supabase, categoryId) {
  try {
    // Check if category exists
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (!existing || checkError) {
      return notFoundError('Category not found');
    }

    // Check if category has books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);

    if (books && books.length > 0) {
      return errorResponse('Cannot delete category with associated books', 'CATEGORY_HAS_BOOKS', 400);
    }

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);

    if (error) throw error;

    return successResponse({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return serverError(error);
  }
}

function forbiddenError(message) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
