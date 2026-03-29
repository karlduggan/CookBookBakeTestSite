import { createSupabaseClient } from '../../utils/supabase.js';
import { authenticateRequest } from '../../utils/auth.js';
import { successResponse, errorResponse, validationError, unauthorizedError, notFoundError, serverError } from '../../utils/response.js';

// POST /api/admin/books - Create new book
// PUT /api/admin/books/:id - Update book
// DELETE /api/admin/books/:id - Delete book

export default async (req: Request) => {
  try {
    const { isAuthenticated, user, error: authError } = authenticateRequest(req.headers);

    if (!isAuthenticated || !user) {
      return unauthorizedError('Unauthorized');
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return forbiddenError('Admin access required');
    }

    const supabase = createSupabaseClient();
    const url = new URL(req.url);
    const bookId = url.searchParams.get('id');

    if (req.method === 'POST') {
      return await createBook(req, supabase);
    } else if (req.method === 'PUT' && bookId) {
      return await updateBook(req, supabase, bookId);
    } else if (req.method === 'DELETE' && bookId) {
      return await deleteBook(supabase, bookId);
    } else if (req.method === 'GET') {
      return await getAllBooks(supabase);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Admin books error:', error);
    return serverError();
  }
};

async function createBook(req: Request, supabase: any) {
  try {
    const body = await req.json();

    // Validation
    if (!body.title || !body.author || !body.isbn || !body.price || body.stock_quantity === undefined) {
      return validationError('Missing required fields: title, author, isbn, price, stock_quantity');
    }

    if (body.price < 0 || body.stock_quantity < 0) {
      return validationError('Price and stock must be non-negative');
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        title: body.title,
        author: body.author,
        isbn: body.isbn,
        description: body.description || null,
        price: body.price,
        stock_quantity: body.stock_quantity,
        cover_image_url: body.cover_image_url || null,
        category_id: body.category_id || null,
        featured: body.featured || false,
        bestseller: body.bestseller || false,
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data, 201);
  } catch (error) {
    console.error('Create book error:', error);
    return serverError();
  }
}

async function updateBook(req: Request, supabase: any, bookId: string) {
  try {
    const body = await req.json();

    // Validate book exists
    const { data: existingBook, error: fetchError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .single();

    if (fetchError || !existingBook) {
      return notFoundError('Book not found');
    }

    // Price and stock validation
    if (body.price !== undefined && body.price < 0) {
      return validationError('Price must be non-negative');
    }

    if (body.stock_quantity !== undefined && body.stock_quantity < 0) {
      return validationError('Stock quantity must be non-negative');
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.isbn !== undefined) updateData.isbn = body.isbn;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.stock_quantity !== undefined) updateData.stock_quantity = body.stock_quantity;
    if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.bestseller !== undefined) updateData.bestseller = body.bestseller;

    const { data, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    console.error('Update book error:', error);
    return serverError();
  }
}

async function deleteBook(supabase: any, bookId: string) {
  try {
    // Check if book exists
    const { data: existingBook, error: fetchError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .single();

    if (fetchError || !existingBook) {
      return notFoundError('Book not found');
    }

    const { error } = await supabase.from('books').delete().eq('id', bookId);

    if (error) throw error;

    return successResponse({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    return serverError();
  }
}

async function getAllBooks(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, isbn, price, stock_quantity, featured, bestseller, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    console.error('Get all books error:', error);
    return serverError();
  }
}

function forbiddenError(message: string) {
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
