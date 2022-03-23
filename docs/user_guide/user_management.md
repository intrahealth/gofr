# User Management

 User management is the module which enables the effective management of users by assigning the necessary roles and tasks to be carried out.

## Overview

!!! important "How do you manage users in gofr?"
In order to manage  user access in gofr, you need to access the **Keycloak Administration Console**.

![Alt text](../img/gofr_key_cloak.JPG 'GOFR Key CLoak Admin Console')

 From the Admin Console, you have a wide range of actions you can perform to manage users.
![Alt text](../img/gofr_manage_users.JPG 'GOFR Manage Users')

## Managing User Roles

There are three types of user roles in gofr. They are:

* Admin role
* Data manager role
* Open role

The initial server configuration includes an administrator role.
This account and password should be immediately changed after installation. See the Developer Guide for more information.

Accounts assigned the admin role can add users, configure the system, and  undertake all the tasks of data managers.
Data manager accounts are limited to only managing data. They can share data sources and do other matching tasks.
Custom accounts with specific roles may be created in the future.

PS: Please let the community know if you have use cases for custom account roles.

## Searching for a user

Search for a user to view detailed information about the user, such as the user’s groups and roles.

Procedure

1. Click Users in the main menu. This Users page is displayed.
2. Type the full name, last name, first name, or email address of the user you want to search for in the search box. The search returns all users who match your criteria.

## View All Users

To view all the users in gofr,click View all users to list every user in the system.

## Creating a user

To create a new user ->

1. Click Users in the menu.
2. Click Add User.
3. Enter the details for the new user.
4. Click Save. After saving the details, the Management page for the new user is displayed.

_Username is the only required field_

## Deleting a user

You can delete a user, who no longer needs access to gofr. If a user is deleted, the user profile and data is also deleted.

To delete a user ->

1. Click Users in the menu. The Users page is displayed.
2. Click View all users to find a user to delete.

![Alt text](../img/gofr_delete_user.JPG 'GOFR Key CLoak Delete User')

~~ Alternatively, you can use the search bar to find a user.~~

3. Click the 'Delete' :delete: icon next to the user you want to remove and confirm deletion.
Enabling account deletion by users
End users and applications can delete their accounts in the Account Console if you enable this capability in the Admin Console. Once you enable this capability, you can give that capability to specific users.
Enabling the Delete Account Capability
You enable this capability on the Required Actions tab.
Procedure
1. Click Authentication in the menu.
2. Click the Required Actions tab.
3. Select Enabled on the Delete Account row.
Delete account on required actions tab

Giving a user the delete-account role
You can give specific users a role that allows account deletion.
Procedure

1. Click Users in the menu.
2. Select a user.
3. Click the Role Mappings tab.
4. From the Client Roles list, select account.
5. Under Available Roles, select delete-account.
6. Click Add selected.
Delete-account role

Deleting your account
Once you have the delete-account role, you can delete your own account.

1. Log into the Account Console.
2. At the bottom of the Personal Info page, click Delete Account.
Delete account page

3. Enter your credentials and confirm the deletion.
Delete confirmation

 This action is irreversible. All your data in Keycloak will be removed.
Configuring user attributes
User attributes provide a customized experience for each user. You can create a personalized identity for each user in the console by configuring user attributes.
Users

Prerequisite
• You are in the realm where the user exists.
Procedure

1. Click Users in the menu.
2. Select a user to manage.
3. Click the Attributes tab.
4. Enter the attribute name in the Key field.
5. Enter the attribute value in the Value field.
6. Click Add.
7. Click Save.
 Some read-only attributes are not supposed to be updated by the administrators. This includes attributes that are read-only by design like for example LDAP_ID, which is filled automatically by the LDAP provider. Some other attributes should be read-only for typical user administrators due to security reasons. See the details in the Mitigating security threats chapter.
User credentials
You can manage credentials of a user in the Credentials tab.
Credential management

This tab includes the following fields:
Position
The arrow buttons in the Position column allow you to shift the priority of the credential for the user. The topmost credential has the highest priority. The priority determines which credential is displayed first after a user logs in.
Type
This column displays the type of credential, for example password or OTP.
User Label
This is an assignable label to recognize the credential when presented as a selection option during login. It can be set to any value to describe the credential.
Data
This is the non-confidential technical information about the credential. It is hidden, by default. You can click Show data… to display the data for a credential.
Actions
This column has two actions. Click Save to record the value or the user field. Click Delete to remove the credential.
You cannot configure other types of credentials for a specific user in the admin console; that task is the user’s responsibility.
You can delete the credentials of a user in the event a user loses an OTP device or if credentials have been compromised. You can only delete credentials of a user in the Credentials tab.
Setting a password for a user
Edit this sectionReport an issue
If a user does not have a password, or if the password has been deleted, the Set Password section is displayed.
If a user already has a password, it can be reset in the Reset Password section.
Procedure

1. Click Users in the menu. The Users page is displayed.
2. Select a user.
3. Click the Credentials tab.
4. Type a new password in the Set Password section.
5. Click Set Password.
 If Temporary is ON, the user must change the password at the first login. To allow users to keep the password supplied, set Temporary to OFF. The user must click Set Password to change the password.
6. Alternatively, you can send an email to the user that requests the user reset the password.
a. Navigate to the Reset Actions list under Credential Reset.
b. Select Update Password from the list.
c. Click Send Email. The sent email contains a link that directs the user to the Update Password window.
d. Optionally, you can set the validity of the email link. This is set to the default preset in the Tokens tab in Realm Settings.
Creating an OTP
Edit this sectionReport an issue
If OTP is conditional in your realm, the user must navigate to Keycloak Account Console to reconfigure a new OTP generator. If OTP is required, then the user must reconfigure a new OTP generator when logging in.
Alternatively, you can send an email to the user that requests the user reset the OTP generator. The following procedure also applies if the user already has an OTP credential.
Prerequisite
• You are logged in to the appropriate realm.
Procedure
1. Click Users in the main menu. The Users page is displayed.
2. Select a user.
3. Click the Credentials tab.
4. Navigate to the Reset Actions list.
5. Click Configure OTP.
6. Click Send Email. The sent email contains a link that directs the user to the OTP setup page.
Required actions
You can set the actions that a user must perform at the first login. These actions are required after the user provides credentials. After the first login, these actions are no longer required. You add required actions on the Details tab of that user.
The following are examples of required action types:
Update Password
The user must change their password.
Configure OTP
The user must configure a one-time password generator on their mobile device using either the Free OTP or Google Authenticator application.
Verify Email
The user must verify their email account. An email will be sent to the user with a validation link that they must click. Once this workflow is successfully completed, the user will be allowed to log in.
Update Profile
The user must update profile information, such as name, address, email, and phone number.
Setting required actions for one user
Edit this sectionReport an issue
You can set the actions that are required for any user.
Procedure
1. Click Users in the menu.
2. Select a user from the list.
3. Navigate to the Required User Actions list.

4. Select all the actions you want to add to the account.
5. Click the X next to the action name to remove it.
6. Click Save after you select which actions to add.
Setting required actions for all users
Edit this sectionReport an issue
You can specify what actions are required before the first login of all new users. The requirements apply to a user created by the Add User button on the Users page or the Register link on the login page.
Procedure
1. Click Authentication in the menu.
2. Click the Required Actions tab.
3. Click the checkbox in the Default Action column for one or more required actions. When a new user logs in for the first time, the selected actions must be executed.
Enabling terms and conditions as a required action
Edit this sectionReport an issue
You can enable a required action that new users must accept the terms and conditions before logging in to Keycloak for the first time.
Procedure
1. Click Authentication in the menu.
2. Click the Required Actions tab.
3. Enable the Terms and Conditions action.
4. Edit the terms.ftl file in the base login theme.
Additional resources
• For more information on extending and creating themes, see the Server Developer Guide.
User impersonation
An administrator with the appropriate permissions can impersonate a user. For example, if a user experiences a bug in an application, an administrator can impersonate the user to investigate or duplicate the issue.
Any user with the impersonation role in the realm can impersonate a user.
Image:keycloak-images/user-details.png[]
• If the administrator and the user are in the same realm, then the administrator will be logged out and automatically logged in as the user being impersonated.
• If the administrator and user are in different realms, the administrator will remain logged in, and additionally will be logged in as the user in that user’s realm.
In both instances, the User Account Management page of the impersonated user is displayed.
You can access the Impersonate button from the Details tab on the Users page.
Additional resources
• For more information on assigning administration permissions, see the Admin Console Access Control chapter.
User registration
You can use Keycloak as a third-party authorization server to manage application users, including users who self-register. If you enable self-registration, the login page displays a registration link so that user can create an account.
Registration link

A user must add profile information to the registration form to complete registration. The registration form can be customized by removing or adding the fields that must be completed by a user.
Additional resources
• For more information on customizing user registration, see the Server Developer Guide.
Enabling user registration
Edit this sectionReport an issue
Enable users to self-register.
Procedure

1. Click Realm Settings in the main menu.
2. Click the Login tab.
3. Toggle User Registration to ON.
4. Click Save.
After you enable this setting, a Register link displays on the login page of the Admin Console.
Registering as a new user
Edit this sectionReport an issue
As a new user, you must complete a registration form to log in for the first time. You add profile information and a password to register.
Registration form

Prerequisite
• User registration is enabled.
Procedure

1. Click the Register link on the login page. The registration page is displayed.
2. Enter the user profile information.
3. Enter the new password.
4. Click Save.
Enabling reCAPTCHA
To safeguard registration against bots, Keycloak has integration with Google reCAPTCHA.
Once reCAPTCHA is enabled, you can edit register.ftl in your login theme to configure the placement and styling of the reCAPTCHA button on the registration page.
Procedure
1. Enter the following URL in a browser:
<https://developers.google.com/recaptcha/>
2. Create an API key to get your reCAPTCHA site key and secret. Note the reCAPTCHA site key and secret for future use in this procedure.
 The localhost works by default. You do not have to specify a domain.
3. Navigate to the Keycloak admin console.
4. Click Authentication in the menu.
5. Click the Flows tab.
6. Select Registration from the drop down menu.
7. Set the reCAPTCHA requirement to Required. This enables reCAPTCHA.
8. Click Actions to the right of the reCAPTCHA flow entry.
9. Click the Config link.
Recaptcha config page

a. Enter the Recaptcha Site Key generated from the Google reCAPTCHA website.
b. Enter the Recaptcha Secret generated from the Google reCAPTCHA website.
10. Authorize Google to use the registration page as an iframe.
 In Keycloak, websites cannot include a login page dialog in an iframe. This restriction is to prevent clickjacking attacks. You need to change the default HTTP response headers that is set in Keycloak.
a. Click Realm Settings in the menu.
b. Click the Security Defenses tab.
c. Enter <https://www.google.com> in the field for the X-Frame-Options header.
d. Enter <https://www.google.com> in the field for the Content-Security-Policy header.
Additional resources
• For more information on extending and creating themes, see the Server Developer Guide.
Personal data collected by Keycloak
By default, Keycloak collects the following data:
• Basic user profile data, such as the user email, first name, and last name.
• Basic user profile data used for social accounts and references to the social account when using a social login.
• Device information collected for audit and security purposes, such as the IP address, operating system name, and the browser name.
The information collected in Keycloak is highly customizable. The following guidelines apply when making customizations:
• Registration and account forms can contain custom fields, such as birthday, gender, and nationality. An administrator can configure Keycloak to retrieve data from a social provider or a user storage provider such as LDAP.
• Keycloak collects user credentials, such as password, OTP codes, and WebAuthn public keys. This information is encrypted and saved in a database, so it is not visible to Keycloak administrators. Each type of credential can include non-confidential metadata that is visible to administrators such as the algorithm that is used to hash the password and the number of hash iterations used to hash the password.
• With authorization services and UMA support enabled, Keycloak can hold information about some objects for which a particular user is the owner.
User Profile
In Keycloak a user is associated with a set of attributes. These attributes are used to better describe and identify users within Keycloak as well as to pass over additional information about them to applications.
A user profile defines a well-defined schema for representing user attributes and how they are managed within a realm. By providing a consistent view over user information, it allows administrators to control the different aspects on how attributes are managed as well as to make a lot easier to extend Keycloak to support additional attributes.
Among other capabilities, user profile enables administrators to:
• Define a schema for user attributes
• Define whether an attribute is required based on contextual information (e.g.: if required only for users, or admins, or both, or depending on the scope being requested.)
• Define specific permissions for viewing and editing user attributes, making possible to adhere to strong privacy requirements where some attributes can not be seen or be changed by third-parties (including administrators)
• Dynamically enforce user profile compliance so that user information is always updated and in compliance with the metadata and rules associated with attributes
• Define validation rules on a per-attribute basis by leveraging the built-in validators or writing custom ones
• Dynamically render forms that users interact with like registration, update profile, brokering, and personal information in the account console, according to the attribute definitions and without any need to manually change themes.
The User Profile capabilities are backed by the User Profile SPI. By default, these capabilities are disabled and realms are configured to use a default configuration that keeps backward compatibility with the legacy behavior.
 The legacy behavior is about keeping the default constraints used by Keycloak when managing users root attributes such as username, email, first and last name, without any restriction on how custom attributes are managed. Regarding user flows such as registration, profile update, brokering, and managing accounts through the account console, users are restricted to use the attributes aforementioned with the possibility to change theme templates to support additional attributes.
If you are already using Keycloak, the legacy behavior is what you have been using so far.
Differently than the legacy behavior, the declarative provider gives you a lot more flexibility to define the user profile configuration to a realm through the administration console and a well-defined JSON schema.
In the next sections, we’ll be looking at how to use the declarative provider to define your own user profile configuration.
 In the future, the legacy behavior will no longer be supported in Keycloak. Ideally, you should start looking at the new capabilities provided by the User Profile and migrate your realms accordingly.
Enabling the User Profile
 Declarative User Profile is Technology Preview and is not fully supported. This feature is disabled by default.
To enable start the server with --features=preview or --features=declarative-user-profile
In addition to enabling the declarative_user_profile feature, you should enable User Profile for a realm. To do that, click on the Realm Settings link on the left side menu and turn on the User Profile Enabled switch.

Once you enable it and click on the Save button, you can access the User Profile tab from where you can manage the configuration for user attributes.
By enabling the user profile for a realm, Keycloak is going to impose additional constraints on how attributes are managed based on the user profile configuration. In summary, here is the list of what you should expect when the feature is enabled:
• From an administration point of view, the Attributes tab at the user details page will only show the attributes defined in the user profile configuration. The conditions defined on a per-attribute basis will also be taken into account when managing attributes.
• User facing forms like registration, update profile, brokering, and personal info in the account console, are going to be rendered dynamically based on the user profile configuration. For that, Keycloak is going to rely on different templates to render these forms dynamically.
In the next topics, we’ll be exploring how to manage the user profile configuration and how it affects your realm.
Managing the User Profile
The user profile configuration is managed on a per-realm basis. For that, click on the Realm Settings link on the left side menu and then click on the User Profile tab.
User Profile Tab

In the Attributes sub-tab you have a list of the attributes currently associated with the user profile. By default, the configuration is created based on the user root attributes and each attribute is configured with some defaults in terms of validation and permissioning.
In the Attribute Groups sub-tab you can manage attribute groups. An attribute group allows you to correlate attributes so that they are displayed together when rendering user facing forms.
 For now, attribute groups are only used for rendering purposes but in the future they should also enable defining top-level configurations to the attributes they are linked to.
In the JSON Editor sub-tab you can view and edit the configuration using a well-defined JSON schema. Any change you make when at any other tab are reflected in the JSON configuration shown at this tab.
In the next section, you are going to learn how to manage the configuration from the Attributes sub-tab.
Managing Attributes
At the Attributes sub-tab you can create, edit, and delete the attributes associated with the user profile.
To define a new attribute and associate it with the user profile, click on the Create button in the top-right corner of the attribute listing.
Attribute Configuration

When configuring the attribute you can define the following settings:
Name
The name of the attribute.
Display name
A user-friendly name for the attribute, mainly used when rendering user-facing forms. It supports internationalization so that values can be loaded from message bundles.
Attribute Group
The attribute group to which the attribute belongs to, if any.
Enabled when scope
Allows you to define a list of scopes to dynamically enable an attribute. If not set, the attribute is always enabled and its constraints are always enforced when managing user profiles as well as when rendering user-facing forms. Otherwise, the same constraints only apply when any of the scopes in the list is requested by clients.
Required
Set the attribute as required. If not enabled, the attribute is optional. Otherwise, the attribute must be provided by users and administrators with the possibility to also make the attribute required only for users or administrators as well as based on the scopes requested by clients.
Permission
In this section, you can define read and write permissions for users and administrators.
Validation
In this section, you can define the validations that will be performed when managing the attribute value. Keycloak provides a set of built-in validators you can choose from with the possibility to add your own.
Annotation
In this section, you can associate annotations to the attribute. Annotations are mainly useful to pass over additional metadata to frontends for rendering purposes.
Managing Permissions
In the Permission section, you can define the level of access users and administrators have to read and write to an attribute.
Attribute Permission

For that, you can use the following settings:
Can user view?
If enabled, users can view the attribute. Otherwise, users don’t have access to the attribute.
Can user edit?
If enabled, users can view and edit the attribute. Otherwise, users don’t have access to write to the attribute.
Can admin view?
If enabled, administrators can view the attribute. Otherwise, administrators don’t have access to the attribute.
Can admin edit?
If enabled, administrators can view and edit the attribute. Otherwise, administrators don’t have access to write to the attribute.
 When you create an attribute, no permission is set to the attribute. Effectively, the attribute won’t be accessible by either users or administrators. Once you create the attribute, make sure to set the permissions accordingly to that the attribute is only visible by the target audience.
Permissioning has a direct impact on how and who can manage the attribute, as well as on how the attribute is rendered in user-facing forms.
For instance, by marking an attribute as only viewable by users, the administrators won’t have access to the attribute when managing users through the administration console (neither from the User API). Also, users won’t be able to change the attribute when updating their profiles. An interesting configuration if user attributes are fetched from an existing identity store (federation) and you just want to make attributes visible to users without any possibility to update the attribute other than through the source identity store.
Similarly, you can also mark an attribute as writable only for administrators with read-only access for users. In this case, only administrators are going to be allowed to manage the attribute.
Depending on your privacy requirements, you might also want attributes inaccessible to administrators but with read-write permissions for users.
Make sure to set the correct permissions whenever you add a new attribute to the user profile configuration.
Managing validations
In the Validation section, you can choose from different forms of validation to make sure the attribute value conforms to specific rules.
Attribute Validation

Keycloak provides different validators out of the box:
Name Description Configuration
length Check the length of a string value based on a minimum and maximum length. min: an integer to define the minimum allowed length.
max: an integer to define the maximum allowed length.
trim-disabled: a boolean to define whether the value is trimmed prior to validation.
integer Check if the value is an integer and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number. min: an integer to define the lower range.
max: an integer to define the upper range.
double Check if the value is a double and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number. min: an integer to define the lower range.
max: an integer to define the upper range.
uri Check if the value is a valid URI. None
pattern Check if the value matches a specific RegEx pattern. pattern: the RegEx pattern to use when validating values.
error-message: the key of the error message in i18n bundle. If not set a generic message is used.
email Check if the value has a valid e-mail format. None
local-date Check if the value has a valid format based on the realm and/or user locale. None
person-name-prohibited-characters Check if the value is a valid person name as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in person names. error-message: the key of the error message in i18n bundle. If not set a generic message is used.
username-prohibited-characters Check if the value is a valid username as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in usernames. error-message: the key of the error message in i18n bundle. If not set a generic message is used.
options Check if the value is from the defined set of allowed values. Useful to validate values entered through select and multiselect fields. options: array of strings containing allowed values.
Managing annotations
In order to pass additional information to frontends, attributes can be decorated with annotations to dictate how attributes are rendered. This capability is mainly useful when extending Keycloak themes to render pages dynamically based on the annotations associated with attributes. This mechanism is used for example to configure Form input filed for attribute.
Attribute Annotation

Managing Attribute Groups
At the Attribute Groups sub-tab you can create, edit, and delete attribute groups. An attribute group allows you to define a container for correlated attributes so that they are rendered together when at the user-facing forms.
Attribute Group List

 You can’t delete attribute groups that are bound to attributes. For that, you should first update the attributes to remove the binding.
To create a new group, click on the Create button in the top-right corner of the attribute groups listing.
Attribute Group Configuration

When configuring the group you can define the following settings:
Name
The name of the group.
Display name
A user-friendly name for the group, mainly used when rendering user-facing forms. It supports internationalization so that values can be loaded from message bundles.
Display description
A user-friendly text that will be displayed as a tooltip when rendering user-facing forms.
Annotation
In this section, you can associate annotations to the attribute. Annotations are mainly useful to pass over additional metadata to frontends for rendering purposes.
Using the JSON configuration
The user profile configuration is stored using a well-defined JSON schema. You can choose from editing the user profile configuration directly by clicking on the JSON Editor sub-tab.
JSON Configuration

The JSON schema is defined as follows:
{
  "attributes": [
    {
      "name": "myattribute",
      "required": {
        "roles": [ "user", "admin" ],
        "scopes": [ "foo", "bar" ]
      },
      "permissions": {
        "view": [ "admin", "user" ],
        "edit": [ "admin", "user" ]
      },
      "validations": {
        "email": {},
        "length": {
          "max": 255
        }
      },
      "annotations": {
        "myannotation": "myannotation-value"
      }
    }
  ],
  "groups": [
    {
      "name": "personalInfo",
      "displayHeader": "Personal Information"
    }
  ]
}
The schema supports as many attributes as you need.
For each attribute you should define a name and, optionally, the required, permission, and the annotations settings.
Required property
The required setting defines whether an attribute is required. Keycloak allows you to set an attribute as required based on different conditions.
When the required setting is defined as an empty object, the attribute is always required.
{
  "attributes": [
    {
      "name": "myattribute",
      "required": {}
  ]
}
On the other hand, you can choose to make the attribute required only for users, or administrators, or both. As well as mark the attribute as required only in case a specific scope is requested when the user is authenticating in Keycloak.
To mark an attribute as required for a user and/or administrator, set the roles property as follows:
{
  "attributes": [
    {
      "name": "myattribute",
      "required": {
        "roles": ["user"]
      }
  ]
}
The roles property expects an array whose values can be either user or admin, depending on whether the attribute is required by the user or the administrator, respectively.
Similarly, you can choose to make the attribute required when a set of one or more scopes is requested by a client when authenticating a user. For that, you can use the scopes property as follows:
{
  "attributes": [
    {
      "name": "myattribute",
      "required": {
        "scopes": ["foo"]
      }
  ]
}
The scopes property is an array whose values can be any string representing a client scope.
Permissions property
The attribute-level permissions property can be used to define the read and write permissions to an attribute. The permissions are set based on whether these operations can be performed on the attribute by a user, or administrator, or both.
{
  "attributes": [
    {
      "name": "myattribute",
      "permissions": {
        "view": ["admin"],
        "edit": ["user"]
      }
  ]
}
Both view and edit properties expect an array whose values can be either user or admin, depending on whether the attribute is viewable or editable by the user or the administrator, respectively.
When the edit permission is granted, the view permission is implicitly granted.
Annotations property
The attribute-level annotation property can be used to associate additional metadata to attributes. Annotations are mainly useful for passing over additional information about attributes to frontends rendering user attributes based on the user profile configuration. Each annotation is a key/value pair.
{
  "attributes": [
    {
      "name": "myattribute",
      "annotations": {
        "foo": ["foo-value"],
        "bar": ["bar-value"]
      }
  ]
}
Using dynamic forms
One of the main capabilities of User Profile is the possibility to dynamically render user-facing forms based on attributes metadata. When you have the feature enabled to your realm, forms like registration and update profile are rendered using specific theme templates to dynamically render pages based on the user profile configuration.
That said, you shouldn’t need to customize templates at all if the default rendering mechanisms serves to your needs. In case you still need customizations to themes, here are the templates you should be looking at:
Template Description
base/login/update-user-profile.ftl The template that renders the update profile page.
base/login/register-user-profile.ftl The template that renders the registration page.
base/login/idp-review-user-profile.ftl The template that renders the page to review/update the user profile when federating users through brokering.
base/login/user-profile-commons.ftl The template that renders input fields in forms based on attributes configuration. Used from all three page templates described above. New input types can be implemented here.
The default rendering mechanism provides the following capabilities:
• Dynamically display fields based on the permissions set to attributes.
• Dynamically render markers for required fields based on the constraints set to the attributes.
• Dynamically render field input type (text, date, number, select, multiselect) set to an attribute.
• Dynamically render read-only fields depending on the permissions set to an attribute.
• Dynamically order fields depending on the order set to the attributes.
• Dynamically group fields that belong to a same attribute group.
Ordering attributes
The attributes order is set by clicking on the up and down arrows when at the attribute listing page.
Ordering Attributes

The order you set in this page is respected when fields are rendered in dynamic forms.
Grouping attributes
When dynamic forms are rendered, they will try to group together attributes that belong to a same attribute group.
Dynamic Update Profile Form

 When attributes are linked to an attribute group, the attribute order is also important to make sure attributes within the same group are close together, within a same group header. Otherwise, if attributes within a group do not have a sequential order you might have the same group header rendered multiple times in the dynamic form.
Configuring Form input filed for Attributes
Keycloak provides built-in annotations to configure which input type will be used for the attribute in dynamic forms and other aspects of it’s visualization.
Available annotations are:
Name Description
inputType Type of the form input field. Available types are described in a table below.
inputHelperTextBefore Helper text rendered before (above) the input field. Direct text or internationalization pattern (like ${i18n.key}) can be used here. Text is NOT html escaped when rendered into the page, so you can use html tags here to format the text, but you also have to correctly escape html control characters.
inputHelperTextAfter Helper text rendered after (under) the input field. Direct text or internationalization pattern (like ${i18n.key}) can be used here. Text is NOT html escaped when rendered into the page, so you can use html tags here to format the text, but you also have to correctly escape html control characters.
inputOptionsFromValidation Annotation for select and multiselect types. Optional name of custom attribute validation to get input options from. See detailed description below.
inputOptionLabelsI18nPrefix Annotation for select and multiselect types. Internationalization key prefix to render options in UI. See detailed description below.
inputOptionLabels Annotation for select and multiselect types. Optional map to define UI labels for options (directly or using internationalization). See detailed description below.
inputTypePlaceholder HTML input placeholder attribute applied to the field - specifies a short hint that describes the expected value of an input field (e.g. a sample value or a short description of the expected format). The short hint is displayed in the input field before the user enters a value.
inputTypeSize HTML input size attribute applied to the field - specifies the width, in characters, of an single line input field. For fields based on HTML select type it specifies number of rows with options shown. May not work, depending on css in used theme!
inputTypeCols HTML input cols attribute applied to the field - specifies the width, in characters, for textarea type. May not work, depending on css in used theme!
inputTypeRows HTML input rows attribute applied to the field - specifies the height, in characters, for textarea type. For select fields it specifies number of rows with options shown. May not work, depending on css in used theme!
inputTypePattern HTML input pattern attribute applied to the field providing client side validation - specifies a regular expression that an input field’s value is checked against. Useful for single line inputs.
inputTypeMaxLength HTML input maxlength attribute applied to the field providing client side validation - maximal length of the text which can be entered into the input field. Useful for text fields.
inputTypeMinLength HTML input minlength attribute applied to the field providing client side validation - minimal length of the text which can be entered into the input field. Useful for text fields.
inputTypeMax HTML input max attribute applied to the field providing client side validation - maximal value which can be entered into the input field. Useful for numeric fields.
inputTypeMin HTML input min attribute applied to the field providing client side validation - minimal value which can be entered into the input field. Useful for numeric fields.
inputTypeStep HTML input step attribute applied to the field - Specifies the interval between legal numbers in an input field. Useful for numeric fields.
 Field types use HTML form field tags and attributes applied to them - they behave based on the HTML specifications and browser support for them.
Visual rendering also depends on css styles applied in the used theme.
Available inputType annotation values:
Name Description HTML tag used
text Single line text input. input
textarea Multiple line text input. textarea
select Common single select input. See description how to configure options below.
select
select-radiobuttons Single select input through group of radio buttons. See description how to configure options below.
group of input
multiselect Common multiselect input. See description how to configure options below.
select
multiselect-checkboxes Multiselect input through group of checkboxes. See description how to configure options below.
group of input
html5-email Single line text input for email address based on HTML 5 spec. input
html5-tel Single line text input for phone number based on HTML 5 spec. input
html5-url Single line text input for URL based on HTML 5 spec. input
html5-number Single line input for number (integer or float depending on step) based on HTML 5 spec. input
html5-range Slider for number entering based on HTML 5 spec. input
html5-datetime-local Date Time input based on HTML 5 spec. input
html5-date Date input based on HTML 5 spec. input
html5-month Month input based on HTML 5 spec. input
html5-week Week input based on HTML 5 spec. input
html5-time Time input based on HTML 5 spec. input
Defining options for select and multiselect fields
Options for select and multiselect fields are taken from validation applied to the attribute to be sure validation and field options presented in UI are always consistent. By default, options are taken from built-in options validation.
You can use various ways to provide nice human readable labels for select and multiselect options. The simplest case is when attribute values are same as UI labels. No any extra configuration is necessary in this case.
Option values same as UI labels

When attribute value is kind of ID not suitable for UI, you can use simple internationalization support provided by inputOptionLabelsI18nPrefix annotation. It defines prefix for internationalization keys, option value is dot appended to this prefix.
Simple internationalization for UI labels using i18n key prefix

Localized UI label texts for option value have to be provided by userprofile.jobtitle.sweng and userprofile.jobtitle.swarch keys then, using common localization mechanism.
You can also use inputOptionLabels annotation to provide labels for individual options. It contains map of labels for option - key in the map is option value (defined in validation), and value in the map is UI label text itself or its internationalization pattern (like ${i18n.key}) for that option.
 You have to use User Profile JSON Editor to enter map as inputOptionLabels annotation value.
Example of directly entered labels for individual options without internationalization:
"attributes": [
...
{
  "name": "jobTitle",
  "validations": {
    "options": {
      "options":[
        "sweng",
        "swarch"
      ]
    }
  },
  "annotations": {
    "inputType": "select",
    "inputOptionLabels": {
      "sweng": "Software Engineer",
      "swarch": "Software Architect"
    }
  }
}
...
]
Example of the internationalized labels for individual options:
"attributes": [
...
{
  "name": "jobTitle",
  "validations": {
    "options": {
      "options":[
        "sweng",
        "swarch"
      ]
    }
  },
  "annotations": {
    "inputType": "select-radiobuttons",
    "inputOptionLabels": {
      "sweng": "${jobtitle.swengineer}",
      "swarch": "${jobtitle.swarchitect}"
    }
  }
}
...
]
Localized texts have to be provided by jobtitle.swengineer and jobtitle.swarchitect keys then, using common localization mechanism.
Custom validator can be used to provide options thanks to inputOptionsFromValidation attribute annotation. This validation have to have options config providing array of options. Internationalization works the same way as for options provided by built-in options validation.
Options provided by custom validator

Forcing User Profile compliance
In order to make sure user profiles are in compliance with the configuration, administrators may use the VerifyProfile required action to eventually force users to update their profiles when authenticating to Keycloak.
 The VerifyProfile action is similar to the UpdateProfile action. However, it leverages all the capabilities provided by the user profile to automatically enforce compliance with the user profile configuration.
When enabled, the VerifyProfile action is going to perform the following steps when the user is authenticating:
• Check whether the user profile is fully compliant with the user profile configuration set to the realm.
• If not, perform an additional step during the authentication so that the user can update any missing or invalid attribute.
• If the user profile is compliant with the configuration, no additional step is performed, and the user continues with the authentication process.
By default, the VerifyProfile action is disabled. To enabled it, click on the Authentication link on the left side menu and then click on the Required Actions tab. At this tab, click on the Register button and select the VerifyProfile action.
Registring the VerifyProfile Required Action

Migrating to User Profile
Before enabling the User Profile capabilities to a realm, there are some important considerations you should be aware of. By providing a single place to manage attribute metadata, the feature is very strict about the attributes that can be set to users and how they are managed.
In terms of user management, administrators are able to manage only the attributes defined in the user profile configuration. Any other attribute set to the user and not yet defined in the user profile configuration won’t be accessible. It is recommended to update your user profile configuration with all the user attributes you want to expose either to users or administrators.
The same recommendation applies for those accessing the User REST API to query user information.
In regards to Keycloak internal user attributes such as LDAP_ID, LDAP_ENTRY_DN, or KERBEROS_PRINCIPAL, if you want to be able to access those attributes you should have them as attributes in your user profile configuration. The recommendation is to mark these attributes as viewable only to administrators so that you can look at them when managing the user attributes through the administration console or querying users via User API.
In regards to theming, if you already have customizations to the legacy templates (those hardcoded with user root attributes) your custom templates won’t be used when rendering user-facing forms but the new templates that render these forms dynamically. Ideally, you should avoid having any customizations to templates and try to stick with the behavior provided by these new templates to dynamically render forms for you. If they are still not enough to address your requirements, you can either customize them or provide us with any feedback so that we discuss whether it makes sense to enhance the new templates.

## Self-registration

Administrators may configure the system to allow for anyone to self-register. This is under the Configure System tab. This option is off by default.