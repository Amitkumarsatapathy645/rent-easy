import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import User from '@/models/User';
import { cloudinary } from '@/lib/cloudinary';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const properties = await Property.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/properties - Starting...');
  
  try {
    // Check session first
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');

    if (!session || session.user.role !== 'owner') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Processing form data...');
    const formData = await request.formData();
    
    // Extract and validate basic fields
    const title = formData.get('title')?.toString()?.trim();
    const description = formData.get('description')?.toString()?.trim();
    const rentStr = formData.get('rent')?.toString()?.trim();
    const depositStr = formData.get('deposit')?.toString()?.trim();
    const bhkStr = formData.get('bhk')?.toString()?.trim();
    const furnishing = formData.get('furnishing')?.toString()?.trim();
    const propertyType = formData.get('propertyType')?.toString()?.trim();
    const areaStr = formData.get('area')?.toString()?.trim();
    
    // Convert numeric fields with validation
    const rent = rentStr ? parseFloat(rentStr) : 0;
    const deposit = depositStr ? parseFloat(depositStr) : 0;
    const bhk = bhkStr ? parseInt(bhkStr) : 0;
    const area = areaStr ? parseFloat(areaStr) : 0;
    
    // Extract location fields
    const locationAddress = formData.get('location.address')?.toString()?.trim();
    const locationCity = formData.get('location.city')?.toString()?.trim();
    const locationState = formData.get('location.state')?.toString()?.trim();
    const locationPincode = formData.get('location.pincode')?.toString()?.trim();
    
    // Extract coordinates
    const locationLatStr = formData.get('location.coordinates.lat')?.toString()?.trim();
    const locationLngStr = formData.get('location.coordinates.lng')?.toString()?.trim();
    
    const locationLat = locationLatStr ? parseFloat(locationLatStr) : 0;
    const locationLng = locationLngStr ? parseFloat(locationLngStr) : 0;
    
    // Extract other fields
    const amenitiesStr = formData.get('amenities')?.toString()?.trim();
    const amenities = amenitiesStr ? amenitiesStr.split(',').map(item => item.trim()).filter(item => item.length > 0) : [];
    const availableFromStr = formData.get('availableFrom')?.toString()?.trim();
    const images = formData.getAll('images') as File[];

    console.log('Extracted data:', { 
      title, 
      rent, 
      deposit, 
      bhk, 
      area,
      locationLat,
      locationLng,
      imagesCount: images.length 
    });

    // Validation
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    if (!locationAddress) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    if (!locationCity) return NextResponse.json({ error: 'City is required' }, { status: 400 });
    if (!locationState) return NextResponse.json({ error: 'State is required' }, { status: 400 });
    if (!locationPincode) return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    if (!propertyType) return NextResponse.json({ error: 'Property type is required' }, { status: 400 });
    if (!furnishing) return NextResponse.json({ error: 'Furnishing is required' }, { status: 400 });
    if (!availableFromStr) return NextResponse.json({ error: 'Available from date is required' }, { status: 400 });

    if (isNaN(rent) || rent <= 0) return NextResponse.json({ error: 'Valid rent amount is required' }, { status: 400 });
    if (isNaN(deposit) || deposit < 0) return NextResponse.json({ error: 'Valid deposit amount is required' }, { status: 400 });
    if (isNaN(bhk) || bhk <= 0 || bhk > 10) return NextResponse.json({ error: 'BHK must be between 1 and 10' }, { status: 400 });
    if (isNaN(area) || area <= 0) return NextResponse.json({ error: 'Valid area is required' }, { status: 400 });

    if (!locationLatStr || !locationLngStr) return NextResponse.json({ error: 'Coordinates are required' }, { status: 400 });
    if (isNaN(locationLat) || isNaN(locationLng)) return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    if (locationLat < -90 || locationLat > 90) return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 });
    if (locationLng < -180 || locationLng > 180) return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 });

    if (!['Fully Furnished', 'Semi Furnished', 'Unfurnished'].includes(furnishing)) {
      return NextResponse.json({ error: 'Invalid furnishing type' }, { status: 400 });
    }
    if (!['Apartment', 'House', 'Villa', 'Studio', 'PG'].includes(propertyType)) {
      return NextResponse.json({ error: 'Invalid property type' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(locationPincode)) {
      return NextResponse.json({ error: 'Pincode must be 6 digits' }, { status: 400 });
    }

    const availableFromDate = new Date(availableFromStr);
    if (isNaN(availableFromDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    // Validate images first
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one property image is required' }, { status: 400 });
    }

    // Upload images to Cloudinary
    console.log('Starting image upload to Cloudinary...');
    const imageUrls: string[] = [];
    
    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`Processing image ${i + 1}/${images.length}: ${image.name}`);
        
        // Validate each image
        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: `Image "${image.name}" exceeds 5MB limit` }, { status: 400 });
        }
        
        if (!image.type.startsWith('image/')) {
          return NextResponse.json({ error: `File "${image.name}" is not a valid image` }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Create readable stream from buffer
        const stream = Readable.from(buffer);
        
        console.log(`Uploading image ${i + 1} to Cloudinary...`);
        
        // Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'rental-properties',
              resource_type: 'image',
              transformation: [
                { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
                { format: 'webp' }
              ],
              public_id: `property_${Date.now()}_${i}`,
              overwrite: true
            },
            (error, result) => {
              if (error) {
                console.error(`Cloudinary upload error for image ${i + 1}:`, error);
                reject(new Error(`Failed to upload image "${image.name}": ${error.message}`));
              } else {
                console.log(`Image ${i + 1} uploaded successfully:`, result?.public_id);
                resolve(result);
              }
            }
          );
          
          // Pipe the stream to Cloudinary
          stream.pipe(uploadStream);
        });

        // Add the uploaded image URL to our array
        imageUrls.push(uploadResult.secure_url);
        console.log(`Image ${i + 1} URL:`, uploadResult.secure_url);
      }
      
      console.log(`All ${images.length} images uploaded successfully to Cloudinary`);
      
    } catch (uploadError: any) {
      console.error('Error during image upload:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload images',
        details: uploadError.message 
      }, { status: 500 });
    }

    console.log('Connecting to database...');
    await connectDB();

    // Get user phone if available
    const user = await User.findById(session.user.id);
    const ownerPhone = user?.phone || '';

    console.log('Creating property...');
    const property = new Property({
      title,
      description,
      rent,
      deposit,
      bhk,
      furnishing,
      propertyType,
      area,
      location: {
        address: locationAddress,
        city: locationCity,
        state: locationState,
        pincode: locationPincode,
        coordinates: { lat: locationLat, lng: locationLng }
      },
      amenities,
      images: imageUrls, // Use actual uploaded Cloudinary URLs
      ownerId: session.user.id,
      ownerName: session.user.name || 'Unknown',
      ownerEmail: session.user.email || '',
      ownerPhone: ownerPhone,
      isVerified: false,
      isActive: true,
      availableFrom: availableFromDate,
      viewCount: 0,
      inquiryCount: 0,
      isPremium: false
    });

    console.log('Saving property to database...');
    const savedProperty = await property.save();
    console.log('Property saved successfully:', savedProperty._id);

    return NextResponse.json({ 
      message: 'Property created successfully with images uploaded to Cloudinary', 
      property: {
        id: savedProperty._id,
        title: savedProperty.title,
        imageCount: imageUrls.length,
        images: imageUrls
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ 
      error: 'Failed to create property',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again'
    }, { status: 500 });
  }
}
