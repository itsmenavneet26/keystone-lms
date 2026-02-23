import frappe

from keystone_lms.install import create_batch_source


def execute():
	frappe.reload_doc("keystone_lms", "doctype", "lms_source")
	create_batch_source()
