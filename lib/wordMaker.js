const fs = require('fs');
const { AlignmentType, Document, Footer, Header, Packer, PageBreak, PageNumber, Paragraph, TextRun } = require("docx");
exports.convertTextToDocs = async (texts, source, options) => {
    const doc = new Document({
        sections: [
            {
                properties: {
                    titlePage: true,
                },
                headers: options?.header?.hasHeader ? {
                    default: new Header({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    // new TextRun("My Title "),
                                    new TextRun({
                                        children: ["Page ", PageNumber.CURRENT],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    first: new Header({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    // new TextRun("First Page Header "),
                                    new TextRun({
                                        children: ["Page ", PageNumber.CURRENT],
                                    }),
                                ],
                            }),
                        ],
                    }),
                } : undefined,
                footers: options?.footer?.hasFooter ? {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    // new TextRun("My Title "),
                                    new TextRun({
                                        children: ["Footer - Page ", PageNumber.CURRENT],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    first: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    // new TextRun("First Page Footer "),
                                    new TextRun({
                                        children: ["Page ", PageNumber.CURRENT],
                                    }),
                                ],
                            }),
                        ],
                    }),
                } : undefined,

                children: [
                    new Paragraph({
                        children: [new TextRun(texts), new PageBreak()],
                    }),
                ],
            },
        ],
    });

    // Used to export the file into a .docx file
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(source, buffer);
    });

};