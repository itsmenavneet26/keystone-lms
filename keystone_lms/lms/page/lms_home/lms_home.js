frappe.pages["lms-home"].on_page_load = function (wrapper) {
	const lmsPath = frappe.boot.lms_path || "keystone_lms";
	window.location.href = `/${lmsPath}/courses`;
};
