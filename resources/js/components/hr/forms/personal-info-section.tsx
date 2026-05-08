import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Upload, X } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PersonalInfoData {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix?: string;
    date_of_birth: string;
    place_of_birth: string;
    is_pwd: boolean;
    gender: string;
    civil_status: string;
    spouse_name: string;
    spouse_date_of_birth: string;
    spouse_contact_number: string;
    father_name: string;
    father_date_of_birth: string;
    mother_name: string;
    mother_date_of_birth: string;
    email: string;
    phone: string;
    mobile: string;
    current_address: string;
    permanent_address: string;
    same_as_current: boolean;
    profile_picture?: File | null;
    profile_picture_path?: string | null;
}

interface PersonalInfoSectionProps {
    data: PersonalInfoData;
    onChange: (field: keyof PersonalInfoData, value: string | boolean) => void;
    onFileChange?: (file: File | null) => void;
    errors?: Partial<Record<keyof PersonalInfoData, string>>;
}

// ============================================================================
// Component
// ============================================================================

export function PersonalInfoSection({ data, onChange, onFileChange, errors = {} }: PersonalInfoSectionProps) {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileChange?.(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        onFileChange?.(null);
        setPreviewUrl(null);
    };

    const handleSameAsCurrentChange = (checked: boolean) => {
        onChange('same_as_current', checked);
        if (checked) {
            onChange('permanent_address', data.current_address);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Basic personal details and contact information</CardDescription>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">

                
                {/* Profile Picture */}
                <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-4">Profile Picture</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Preview */}
                            <div className="flex-shrink-0">
                                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 overflow-hidden shadow-sm">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                                    ) : data.profile_picture_path ? (
                                        <img src={`/storage/${data.profile_picture_path}`} alt="Current profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-24 h-24 text-muted-foreground/50" />
                                    )}
                                </div>
                            </div>
                            {/* Upload Control */}
                            <div className="flex-1 space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="profile_picture">Upload Photo</Label>
                                    <div className="relative">
                                        <input
                                            id="profile_picture"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                            onChange={handleProfilePictureChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="profile_picture"
                                            className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="text-center">
                                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {(previewUrl || data.profile_picture) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveProfilePicture}
                                        className="w-full"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Remove Picture
                                    </Button>
                                )}
                                {errors.profile_picture && (
                                    <p className="text-xs text-destructive">{errors.profile_picture}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">
                            First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            value={data.first_name}
                            onChange={(e) => onChange('first_name', e.target.value)}
                            placeholder="Juan"
                        />
                        {errors.first_name && (
                            <p className="text-xs text-destructive">{errors.first_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                            id="middle_name"
                            value={data.middle_name}
                            onChange={(e) => onChange('middle_name', e.target.value)}
                            placeholder="Santos"
                        />
                        {errors.middle_name && (
                            <p className="text-xs text-destructive">{errors.middle_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">
                            Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={(e) => onChange('last_name', e.target.value)}
                            placeholder="Dela Cruz"
                        />
                        {errors.last_name && (
                            <p className="text-xs text-destructive">{errors.last_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="suffix">Suffix</Label>
                        <Input
                            id="suffix"
                            value={data.suffix || ''}
                            onChange={(e) => onChange('suffix', e.target.value)}
                            placeholder="Jr., Sr., III"
                        />
                        {errors.suffix && (
                            <p className="text-xs text-destructive">{errors.suffix}</p>
                        )}
                    </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">
                            Date of Birth <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) => onChange('date_of_birth', e.target.value)}
                        />
                        {errors.date_of_birth && (
                            <p className="text-xs text-destructive">{errors.date_of_birth}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">
                            Gender <span className="text-destructive">*</span>
                        </Label>
                        <Select value={data.gender || 'male'} onValueChange={(value) => onChange('gender', value)}>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && (
                            <p className="text-xs text-destructive">{errors.gender}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="civil_status">
                            Civil Status <span className="text-destructive">*</span>
                        </Label>
                        <Select value={data.civil_status || 'single'} onValueChange={(value) => onChange('civil_status', value)}>
                            <SelectTrigger id="civil_status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                                <SelectItem value="separated">Separated</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.civil_status && (
                            <p className="text-xs text-destructive">{errors.civil_status}</p>
                        )}
                    </div>
                </div>

                {/* Place of Birth and PWD Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="place_of_birth">Place of Birth</Label>
                        <Input
                            id="place_of_birth"
                            value={data.place_of_birth || ''}
                            onChange={(e) => onChange('place_of_birth', e.target.value)}
                            placeholder="City, Province"
                        />
                        {errors.place_of_birth && (
                            <p className="text-xs text-destructive">{errors.place_of_birth}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                        <input
                            type="checkbox"
                            id="is_pwd"
                            checked={data.is_pwd || false}
                            onChange={(e) => onChange('is_pwd', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_pwd" className="font-normal cursor-pointer">
                            Person with Disability (PWD)
                        </Label>
                    </div>
                </div>

                {/* Spouse Information (shown when married) */}
                {data.civil_status === 'married' && (
                    <div className="border-t pt-6">
                        <h3 className="text-sm font-semibold mb-4">Spouse Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="spouse_name">Spouse Name</Label>
                                <Input
                                    id="spouse_name"
                                    value={data.spouse_name || ''}
                                    onChange={(e) => onChange('spouse_name', e.target.value)}
                                    placeholder="Full name"
                                />
                                {errors.spouse_name && (
                                    <p className="text-xs text-destructive">{errors.spouse_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spouse_date_of_birth">Spouse Date of Birth</Label>
                                <Input
                                    id="spouse_date_of_birth"
                                    type="date"
                                    value={data.spouse_date_of_birth || ''}
                                    onChange={(e) => onChange('spouse_date_of_birth', e.target.value)}
                                />
                                {errors.spouse_date_of_birth && (
                                    <p className="text-xs text-destructive">{errors.spouse_date_of_birth}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spouse_contact_number">Spouse Contact Number</Label>
                                <Input
                                    id="spouse_contact_number"
                                    type="tel"
                                    value={data.spouse_contact_number || ''}
                                    onChange={(e) => onChange('spouse_contact_number', e.target.value)}
                                    placeholder="0917-123-4567"
                                />
                                {errors.spouse_contact_number && (
                                    <p className="text-xs text-destructive">{errors.spouse_contact_number}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Parents Information */}
                <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-4">Parents Information</h3>
                    <div className="space-y-6">
                        {/* Father */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="father_name">Father's Name</Label>
                                <Input
                                    id="father_name"
                                    value={data.father_name || ''}
                                    onChange={(e) => onChange('father_name', e.target.value)}
                                    placeholder="Full name"
                                />
                                {errors.father_name && (
                                    <p className="text-xs text-destructive">{errors.father_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="father_date_of_birth">Father's Date of Birth</Label>
                                <Input
                                    id="father_date_of_birth"
                                    type="date"
                                    value={data.father_date_of_birth || ''}
                                    onChange={(e) => onChange('father_date_of_birth', e.target.value)}
                                />
                                {errors.father_date_of_birth && (
                                    <p className="text-xs text-destructive">{errors.father_date_of_birth}</p>
                                )}
                            </div>
                        </div>

                        {/* Mother */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mother_name">Mother's Name</Label>
                                <Input
                                    id="mother_name"
                                    value={data.mother_name || ''}
                                    onChange={(e) => onChange('mother_name', e.target.value)}
                                    placeholder="Full name"
                                />
                                {errors.mother_name && (
                                    <p className="text-xs text-destructive">{errors.mother_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mother_date_of_birth">Mother's Date of Birth</Label>
                                <Input
                                    id="mother_date_of_birth"
                                    type="date"
                                    value={data.mother_date_of_birth || ''}
                                    onChange={(e) => onChange('mother_date_of_birth', e.target.value)}
                                />
                                {errors.mother_date_of_birth && (
                                    <p className="text-xs text-destructive">{errors.mother_date_of_birth}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => onChange('email', e.target.value)}
                                placeholder="juan.delacruz@example.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => onChange('phone', e.target.value)}
                                placeholder="(02) 1234-5678"
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobile">
                                Mobile Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={data.mobile}
                                onChange={(e) => onChange('mobile', e.target.value)}
                                placeholder="0917-123-4567"
                            />
                            {errors.mobile && (
                                <p className="text-xs text-destructive">{errors.mobile}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-4">Address Information</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_address">
                                Current Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="current_address"
                                value={data.current_address}
                                onChange={(e) => onChange('current_address', e.target.value)}
                                placeholder="Street, Barangay, City, Province"
                            />
                            {errors.current_address && (
                                <p className="text-xs text-destructive">{errors.current_address}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="same_as_current"
                                checked={data.same_as_current}
                                onChange={(e) => handleSameAsCurrentChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="same_as_current" className="font-normal cursor-pointer">
                                Permanent address is same as current address
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="permanent_address">
                                Permanent Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="permanent_address"
                                value={data.permanent_address}
                                onChange={(e) => onChange('permanent_address', e.target.value)}
                                placeholder="Street, Barangay, City, Province"
                                disabled={data.same_as_current}
                            />
                            {errors.permanent_address && (
                                <p className="text-xs text-destructive">{errors.permanent_address}</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
