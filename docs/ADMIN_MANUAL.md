# Django Admin User Management Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Accessing the Admin Interface](#accessing-the-admin-interface)
3. [Creating New Users](#creating-new-users)
4. [Managing Existing Users](#managing-existing-users)
5. [User Permissions and Roles](#user-permissions-and-roles)
6. [Troubleshooting](#troubleshooting)

## Introduction

This guide will help you manage users in your application through the Django admin interface. The admin interface is a powerful tool that allows you to create, edit, and manage user accounts for your team members.

## Accessing the Admin Interface

1. Open your web browser and navigate to your admin URL (typically `https://your-domain.com/admin/`)
2. Log in using your superuser credentials
3. Once logged in, you'll see the admin dashboard with various management options

## Creating New Users

To create a new user:

1. In the admin dashboard, find and click on "Users" in the list of models
2. Click the "Add User" button in the top right corner
3. Fill in the required information:
   - **Email**: The user's email address (this will be their username)
   - **Password**: Create a secure password
   - **Password (again)**: Re-enter the password to confirm
4. Click "Save" to create the user

After creating the user, you can add additional information:

1. Click on the newly created user to edit their details
2. Fill in optional information:
   - **First name**: The user's first name
   - **Last name**: The user's last name
   - **Phone**: The user's phone number
   - **Image**: Upload a profile picture (optional)
3. Set the appropriate permissions:
   - **Active**: Check this to allow the user to log in
   - **Staff status**: Check this to allow access to the admin interface
   - **Superuser status**: Check this to give full administrative access
4. Click "Save" to update the user's information

## Managing Existing Users

To manage existing users:

1. In the admin dashboard, click on "Users"
2. You'll see a list of all users with their:
   - Email address
   - First name
   - Last name
   - Phone number
   - Verification status
   - Staff status
   - Superuser status

You can:

- Click on any user to edit their details
- Use the search bar to find specific users
- Filter users by staff status, superuser status, or active status
- Delete users by selecting them and choosing "Delete selected users" from the action dropdown

## User Permissions and Roles

The system has two main permission levels:

1. **Regular Users**:

   - Can log in to the application
   - Cannot access the admin interface
   - Have read-only application access

2. **Superusers**:
   - Can log in to the application
   - Have full access to the admin interface
   - Can manage all aspects of the system
   - Can create and manage other users
   - Have editor access to the schedule

To change a user's permissions:

1. Edit the user's details
2. Check/uncheck the appropriate boxes:
   - "Staff status" for admin access
   - "Superuser status" for full administrative privileges
3. Click "Save" to apply changes

## Troubleshooting

Common issues and solutions:

1. **User cannot log in**:

   - Verify the user's email and password are correct
   - Check if the user's account is marked as "Active"
   - Ensure the user has the correct permissions

2. **User cannot access admin interface**:

   - Verify the user has "Staff status" enabled
   - Check if the user has the necessary permissions

3. **Password reset**:

   - As an admin, you cannot view a user's password, but can change a user's password by editing their account

For additional support or questions, please contact your system administrator.
