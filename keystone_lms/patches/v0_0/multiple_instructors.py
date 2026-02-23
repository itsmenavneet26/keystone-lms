import frappe


def execute():
	frappe.reload_doc("keystone_lms", "doctype", "lms_course")
	frappe.reload_doc("keystone_lms", "doctype", "course_instructor")
	courses = frappe.get_all("LMS Course", fields=["name", "instructor"])
	for course in courses:
		doc = frappe.get_doc(
			{
				"doctype": "Course Instructor",
				"parent": course.name,
				"parentfield": "instructors",
				"parenttype": "LMS Course",
				"instructor": course.instructor,
			}
		)
		doc.save()
