# SupaBase Configuration and Management

* [SupaBase **Konto**](../../../../../../../../PRIV/_KEY/Assets/Services/S/SupaBase/_SupaBase_Konto.md)

## Context
We have chosen **[SupaBase](../../../../../../../../PRIV/_KEY/Assets/Services/S/SupaBase/_SupaBase_Konto.md)** for both

1. **Authentication**: You have to be a registered SupaBase User whose Credentials will be used to login to our Applai Generator Web-App. 

2. **File-Management**: All MasterCV/Template JSON files will be MANUALLY uploaded to Supabase so that they can be accessed by the App, whereas the produced GeneratedCV.json files are automatically stored by the App. 

## SupaBase Configuration

### 1. Uploading SuperCV.json
1. Export a most complete CV from [Reactive Resume](../../../../../../../../JobSuche/06_TOOLS/R/Reactive%20Resume/_Reactive%20Resume.md) and name it **supercv.json** (Alternatively you may find a supercv.json reference file in the *VSC\data\SuperCV\supercv.json*-folder).

2. Upload this SuperCV.json file to SupaBase's "SuperCV" folder in the "Applai" basket.  

### 2. Creating a TestUser Account
The app has no self-registration screen by design (S001 is login-only) and so the **auth.users table is currently empty**. 

Go to your Supabase **Dashboard → Authentication → Users → Add user**, and create an email/password **account for a TestUser there (for the effektively created credentials see -> [SupaBase Konto](../../../../../../../../PRIV/_KEY/Assets/Services/S/SupaBase/_SupaBase_Konto.md) for the "TestUser"-section. (Note that such credentials must neither be shared in documentation nor on GitHub!)

In your LOCAL project files create a local ".env.local" named file in the "VSC/client/src/" rootfolder to contain the follwing two environment variables.

```plaintext
VITE_SUPABASE_URL=https://tascuxigwgedjrztwemj.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhc2N1eGlnd2dlZGpyenR3ZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzU0MTMsImV4cCI6MjEwMjU1MTQxM30.LC2dV30FtxlZFbGIo7xP34ajGZFlSwC2OOWJ0VIRtzE
```

<span style="color:red; font-weight:bold">ACHTUNG</span>: **Then make this ".env.local" file  gitignored** because it must never be commited to the public remote Github Repo for obvious security reasons!

Note here that the such created anon key is a publishable, non-secret key by design and is therefore safe when kept in the compiled client binary.

### Object Creation
The App required two different object

1. in the **STORAGE** section: an **"Applai" called BUCKET** with an **"SuperCV" called folder** for all required and to be generated JSON Files (Master and Generated files in the same folder allows usage of generated files as masters). 

2. in the **DATABASE** section: an **"user-settings" called TABLE** that holds a list of registered and authorized users (which currently have to be created manually as the app does not provide a registration process yet).  

## "Applai" Storage Bucket
The privat "Applai" called Storage bucket provides the four RLS policies for "select", "insert", "update" and "delete" CRUD-Operations, each scoped to authenticated users. 

It contains the fixed "SuperCV" folder to contain all MasterCV.json template files as well as all generated *myGeneratednn.json* files.

## "user_settings" table
The **public.user_settings table** with fields for 
1. user_id
2. master_resume_file
3. preferred_cv_name
4. updated_at

**is [RLS-scoped](#rls)**, so that users can only see/write their own rows.



Once you've created your account and uploaded a real SuperCV.json to the Applai/SuperCV folder (via the Dashboard's Storage browser, since there's no in-app upload yet), you should be able to run the app end-to-end: login → import → select/edit → export.



# Glossar
## Supabase
Supabase is built on PostgreSQL. 

## RLS 
RLS stands for **Row Level Security**.



"RLS-scoped" means the table is protected by Row Level Security policies that govern data access on a per-user, per-row basis and does the following:

1. **Row-level access control**: Instead of granting access to an entire table, RLS lets you restrict which rows a user can see or modify based on their login identity (usually their auth.uid() in Supabase after they have logged into the Superbase Service with their private Superbase Account).

2. **Default deny**: Once RLS is enabled on a table, all access is blocked by default for anonymous/authenticated users unless a specific policy explicitly allows it.

### Example for public.user_settings
If your user_settings table is RLS-scoped, there is likely a policy that looks something like this:

```plaintext
create policy "Users can only access their own settings"
on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

This means:

* User A can only SELECT, UPDATE, or DELETE rows where user_id matches their own UUID.
* They cannot see or touch User B's settings, even if they query the table directly from the client.


### Why it matters
In Supabase, the client (written in Type or JavaScript/Flutter/etc.) often connects directly to the database using the *anon/service* roles. RLS is the primary security mechanism preventing users from reading or tampering with each other's data.