// ref. https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html
export interface GetTextComment {
	translator?: string[];
	reference?: string[];
	extracted?: string[];
	flag?: string;
	previous?: string[];
}
