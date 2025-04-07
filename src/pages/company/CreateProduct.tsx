
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
import { 
  Package2, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Link, 
  Calendar 
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CreateProduct = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priceModel, setPriceModel] = useState('one-time');
  const [tags, setTags] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(new Date());
  const [features, setFeatures] = useState('');
  const [useCases, setUseCases] = useState('');
  const [pricingTiers, setPricingTiers] = useState([
    { name: 'Basic', price: '', features: '' },
    { name: 'Professional', price: '', features: '' },
    { name: 'Enterprise', price: 'Custom pricing', features: '' }
  ]);
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

  const updatePricingTier = (index: number, field: 'name' | 'price' | 'features', value: string) => {
    const newTiers = [...pricingTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setPricingTiers(newTiers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !releaseDate) return;
    
    setIsLoading(true);
    
    try {
      // Format the tags as an array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Format features as an array
      const featuresArray = features.split('\n').map(f => f.trim()).filter(f => f);
      
      // Format use cases as an array
      const useCasesArray = useCases.split('\n').map(u => u.trim()).filter(u => u);
      
      // Format pricing tiers
      const formattedPricingTiers = pricingTiers.map(tier => ({
        name: tier.name,
        price: tier.price,
        features: tier.features.split('\n').map(f => f.trim()).filter(f => f)
      }));
      
      // Create product data object
      const productData = {
        title,
        description,
        long_description: longDescription,
        company_id: currentUser.id,
        company_name: currentUser.name,
        company_logo: currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`,
        price: `${priceModel === 'one-time' ? '' : '$' + price + '/' + priceModel}${priceModel === 'one-time' ? '$' + price : ''}`,
        category,
        tags: tagsArray,
        image: coverImage,
        website_url: websiteUrl,
        demo_url: demoUrl,
        release_date: releaseDate.toISOString(),
        features: featuresArray,
        use_cases: useCasesArray,
        pricing_tiers: formattedPricingTiers
      };
      
      console.log('Submitting product data:', productData);
      
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
    <div className="max-w-4xl mx-auto mb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a New Product</h1>
        <p className="text-gray-500">Showcase your product or service to the community</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package2 className="mr-2 h-5 w-5" />
              Basic Product Information
            </CardTitle>
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
                <Label htmlFor="description">Short Description*</Label>
                <Textarea
                  id="description"
                  placeholder="Write a concise description (1-2 sentences)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description*</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Provide a comprehensive description of your product, its features, and benefits"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
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
                    <SelectItem value="Business Intelligence">Business Intelligence</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price*
                  </Label>
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
                <Label htmlFor="tags" className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  placeholder="e.g. AI, Analytics, Cloud, Enterprise"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="releaseDate" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Release Date*
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="releaseDate"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={releaseDate}
                      onSelect={setReleaseDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">            
            <div className="space-y-2">
              <Label htmlFor="features">Key Features (one per line)*</Label>
              <Textarea
                id="features"
                placeholder="Enter each feature on a new line
e.g. Interactive dashboards with drag-and-drop functionality
Real-time data monitoring and alerts"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                rows={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="useCases">Use Cases (one per line)</Label>
              <Textarea
                id="useCases"
                placeholder="Enter each use case on a new line
e.g. Executive dashboards for C-suite decision making
Sales forecasting and pipeline visualization"
                value={useCases}
                onChange={(e) => setUseCases(e.target.value)}
                rows={5}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label>Pricing Tiers</Label>
              
              {pricingTiers.map((tier, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`tier-${index}-name`}>Tier Name</Label>
                        <Input
                          id={`tier-${index}-name`}
                          value={tier.name}
                          onChange={(e) => updatePricingTier(index, 'name', e.target.value)}
                          placeholder="e.g. Basic, Pro, Enterprise"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`tier-${index}-price`}>Tier Price</Label>
                        <Input
                          id={`tier-${index}-price`}
                          value={tier.price}
                          onChange={(e) => updatePricingTier(index, 'price', e.target.value)}
                          placeholder="e.g. $99/month"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tier-${index}-features`}>Tier Features (one per line)</Label>
                      <Textarea
                        id={`tier-${index}-features`}
                        value={tier.features}
                        onChange={(e) => updatePricingTier(index, 'features', e.target.value)}
                        placeholder="Enter each feature on a new line
e.g. 5 users
Standard dashboards
Email support"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
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
          </CardContent>
        </Card>
        
        {/* URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="mr-2 h-5 w-5" />
              External Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <Dialog open={openGallery} onOpenChange={(open) => {
        setOpenGallery(open);
        if (open) loadImages();
      }}>
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
