import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form action={updateProfile} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input value={user.email} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={user.name ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={user.company ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={user.bio ?? ""} rows={3} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={user.country ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={user.website ?? ""} />
        </div>
        <Button type="submit" className="self-start">
          Save
        </Button>
      </form>
    </div>
  );
}
