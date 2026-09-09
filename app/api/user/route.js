import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      mailingName,
      address,
      state,
      country,
      pincode,
      telephone,
      phone,
      fax,
      email,
      website,
      gst,
      IEC,
      finYear,
      booksBegin,
      currency,
      formalName,
    } = body;

    if (!name || !address || !gst || !IEC || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, Address, GST, IEC, and Phone number are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const newUser = await User.create({
      name,
      mailingName: mailingName || name,
      address,
      state: state || 'Andhra Pradesh',
      country: country || 'India',
      pincode: pincode || '',
      telephone: telephone || '',
      phone,
      fax: fax || '',
      email: email || '',
      website: website || '',
      gst,
      IEC,
      finYear: finYear || '1-Apr-2026',
      booksBegin: booksBegin || '1-Apr-2026',
      currency: currency || '₹',
      formalName: formalName || 'INR',
    });

    return NextResponse.json(
      { success: true, data: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving user data to MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const singleUser = await User.findById(id);
      return NextResponse.json({ success: true, data: singleUser });
    }

    const allUsers = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('Error fetching user data from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
