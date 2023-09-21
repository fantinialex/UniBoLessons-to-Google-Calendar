# UniBo Lessons to Google Calendar
A library for Google Script to easily insert UniBo's class schedule into your own calendar.

Main functions
- Inserting (and updating) lessons on the calendar
- Email notification of any changes
- Ability to disregard some lessons (ex. that reserved for L-Z)
- Ability to select only certain courses in a curriculum
- Ability to automatically enter all courses of a year

## Table of contents
- [How to use the library](#how-to-use-the-library)
- [Examples and available methods](#examples-and-available-methods)
- [Do you want to contribute?](#do-you-want-to-contribute)
- [External resources](#external-resources)

## How to use the library
1. [Create a standalone project](https://developers.google.com/apps-script/guides/projects#create_a_project_from) on [Google Script](https://script.google.com/)
2. Add the following Script ID as [library](https://developers.google.com/apps-script/guides/libraries#add_a_library_to_your_script_project) ```1dcQpP0FJc6SehdmgbkJHKGJHXG3YiMUkkxZmZTEnaqMsOcV4Gnz28Kqy```
3. Write your own code, following the examples in the project wiki
4. Optionally, set the triggers to run the script automatically

## Examples and available methods
Visit the project Wiki.
## Do you want to contribute?
The code is open source so everyone can use it, improve it and customize it as they wish.
If you want to propose changes you can open an Issue and start a discussion (if you prefer, you can also write in Italian), if you are a developer you can also propose your own implementation.
Not sure where to start? Here's a short list of additions to consider
- add the ability to customize the color of a course
- add the ability to customize the location and description template
- add the ability to customize the name of the lessons
- etc.

## External resources
This library makes use of the following projects 
- https://github.com/google/diff-match-patch 