import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage, createProduct } from '@/integrations/supabase/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ImageGallery from '@/components/profile/ImageGallery';
import { DialogContent, Dialog, DialogTitle } from '@/components/ui/dialog';
import { Package2, Image as ImageIcon } from 'lucide-react';

const CreateProduct = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priceModel, setPriceModel] = useState('one-time');
  const [tags, setTags] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  
  // Image gallery state
  const [openGallery, setOpenGallery] = useState(false);
  const [images, setImages] = useState<{name: string; url: string}[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load user's images when opening the gallery
  const loadImages = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('covers')
        .list(`${currentUser.id}`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Error loading images:', error);
        return;
      }

      // Map file objects to image URLs
      const imageUrls = data
        .filter(file => file.name.match(/\.(jpeg|jpg|gif|png)$/i))
        .map(file => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('covers')
            .getPublicUrl(`${currentUser.id}/${file.name}`);
          
          return {
            name: file.name,
            url: publicUrl
          };
        });

      setImages(imageUrls);
    } catch (error) {
      console.error('Error in loadImages:', error);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      // Upload the image to the user's folder in the covers bucket
      const imagePath = `${currentUser.id}`;
      const imageUrl = await uploadImage(file, imagePath);
      
      // Reload the images to show the newly uploaded one
      await loadImages();
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (url: string) => {
    setCoverImage(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Format the tags as an array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Create product data object
      const productData = {
        title,
        description,
        company_id: currentUser.id,
        company_name: currentUser.name,
        company_logo: currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`,
        price: `${priceModel === 'one-time' ? '' : '$' + price + '/' + priceModel}${priceModel === 'one-time' ? '$' + price : ''}`,
        category,
        tags: tagsArray,
        image: coverImage,
        website_url: websiteUrl,
        demo_url: demoUrl,
        release_date: new Date().toISOString()
      };
      
      // Create product in database using our helper function
      const data = await createProduct(productData);
      
      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      });
      
      // Navigate to the product detail page
      navigate(`/company/products/${data.id}`);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Failed to create product",
        description: error.message || "There was an error creating your product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'company') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">Only company accounts can create products.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate('/profile')}
        >
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a New Product</h1>
        <p className="text-gray-500">Showcase your product or service to the community</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Name*</Label>
                <Input
                  id="title"
                  placeholder="Enter product name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product, its features, and benefits"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price*</Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="e.g. 99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priceModel">Pricing Model*</Label>
                  <Select 
                    value={priceModel} 
                    onValueChange={setPriceModel}
                  >
                    <SelectTrigger id="priceModel">
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time payment</SelectItem>
                      <SelectItem value="month">Per month</SelectItem>
                      <SelectItem value="year">Per year</SelectItem>
                      <SelectItem value="user/month">Per user/month</SelectItem>
                      <SelectItem value="user/year">Per user/year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. AI, Analytics, Cloud, Enterprise"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="block mb-2">Cover Image</Label>
                {coverImage ? (
                  <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100 mb-2">
                    <img 
                      src={coverImage} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => setOpenGallery(true)}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenGallery(true)}
                  >
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Button type="button" variant="secondary">
                        Select Cover Image
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Choose an image from your gallery
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://your-product-website.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="demoUrl">Demo URL</Label>
                  <Input
                    id="demoUrl"
                    type="url"
                    placeholder="https://demo.your-product.com"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/company/products')}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
      
      <Dialog open={openGallery} onOpenChange={setOpenGallery}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Your Image Gallery</DialogTitle>
          <ImageGallery
            images={images}
            onSelectImage={handleSelectImage}
            onUploadImage={handleUploadImage}
            uploading={uploading}
            emptyMessage="Upload images to use as cover images for your products."
            aspectRatio="landscape"
            selectedImage={coverImage}
            onClose={() => setOpenGallery(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProduct;
