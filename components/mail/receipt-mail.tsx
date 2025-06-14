import * as React from "react"
import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import { format } from "date-fns"

import { sendReceiptProps } from "@/types/types"
import { configuration } from "@/lib/config"

export const ReceiptMail = ({
  email,
  purchaseId,
  amount,
  productName,
  purchaseDate,
  desc,
  last4,
  brand,
  paymentType,
}: sendReceiptProps) => (
  <Html>
    <Head />
    <Preview>Boring Template Receipt #{purchaseId}</Preview>

    <Body style={main}>
      <Container style={container}>
        <Section>
          <Row>
            <Column>
              <Img
                src={configuration.site.logo}
                width="42"
                height="42"
                alt={`${configuration.site.name} Logo`}
              />
            </Column>

            <Column align="right" style={tableCell}>
              <Text style={heading}>Receipt</Text>
            </Column>
          </Row>
        </Section>
        <Section>
          <Text style={cupomText}>🚀 Thank you for your purchase!</Text>
        </Section>
        <Section style={informationTable}>
          <Row style={informationTableRow}>
            <Column colSpan={2}>
              <Section>
                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>EMAIL</Text>
                    <Link
                      style={{
                        ...informationTableValue,
                        color: "#15c",
                        textDecoration: "underline",
                      }}
                    >
                      {email}
                    </Link>
                  </Column>
                </Row>

                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>INVOICE DATE</Text>
                    <Text style={informationTableValue}>{format(purchaseDate, "dd MMM yyyy")}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>ORDER ID</Text>
                    <Link
                      style={{
                        ...informationTableValue,
                        color: "#15c",
                        textDecoration: "underline",
                      }}
                    >
                      {purchaseId}
                    </Link>
                  </Column>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>DOCUMENT NO.</Text>
                    <Text style={informationTableValue}>#</Text>
                  </Column>
                </Row>
              </Section>
            </Column>
            <Column style={informationTableColumn} colSpan={2}>
              <Text style={informationTableLabel}>BILLED TO</Text>
              <Text style={informationTableValue}>
                {brand} .... {last4} ({paymentType})
              </Text>
              {/* <Text style={informationTableValue}>{name}</Text>
              <Text style={informationTableValue}>{address}</Text>
              <Text style={informationTableValue}>{city}, {state} {zip}</Text>
              <Text style={informationTableValue}>{country}</Text> */}
            </Column>
          </Row>
        </Section>
        <Section style={productTitleTable}>
          <Text style={productsTitle}>Product</Text>
        </Section>
        <Section>
          <Row>
            <Column style={{ width: "64px" }}>
              <Img
                src={configuration.site.logo}
                width="64"
                height="64"
                alt={`${configuration.site.name} Logo`}
                style={productIcon}
              />
            </Column>
            <Column style={{ paddingLeft: "22px" }}>
              <Text style={productTitle}>{productName}</Text>
              <Text style={productDescription}>{desc}</Text>
              <Text style={productDescription}>Renews {format(purchaseDate, "dd MMM yyyy")}</Text>
              <Link
                href="https://www.producthunt.com/posts/the-boring-template"
                style={productLink}
                target="_blank"
              >
                Write a Review
              </Link>
              <span style={divisor}>|</span>
              <Link href="https://x.com/kewinversi" target="_blank" style={productLink}>
                Report a Problem
              </Link>
            </Column>

            <Column style={productPriceWrapper} align="right">
              <Text style={productPrice}>${amount}</Text>
            </Column>
          </Row>
        </Section>
        <Hr style={productPriceLine} />
        <Section align="right">
          <Row>
            <Column style={tableCell} align="right">
              <Text style={productPriceTotal}>TOTAL</Text>
            </Column>
            <Column style={productPriceVerticalLine}></Column>
            <Column style={productPriceLargeWrapper}>
              <Text style={productPriceLarge}>${amount}</Text>
            </Column>
          </Row>
        </Section>

        <Hr style={walletBottomLine} />

        <Section>
          <Row>
            <Column align="center" style={footerIcon}>
              <Img
                src={configuration.site.logo}
                width="26"
                height="26"
                alt={`${configuration.site.name} Logo`}
              />
            </Column>
          </Row>
        </Section>
        <Text style={footerLinksWrapper}>
          <Link href="https://boringtemplate.com/terms">Terms of Service</Link> •{" "}
          <Link href="https://boringtemplate.com/privacy">Privacy Policy </Link>
        </Text>
        <Text style={footerCopyright}>
          Copyright © {new Date().getFullYear()} {configuration.site.name} <br />{" "}
          <Link href="https://boringtemplate.com/license">All rights reserved</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: "#ffffff",
}

const resetText = {
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "660px",
  maxWidth: "100%",
}

const tableCell = { display: "table-cell" }

const heading = {
  fontSize: "32px",
  fontWeight: "300",
  color: "#888888",
}

const cupomText = {
  textAlign: "center" as const,
  margin: "36px 0 40px 0",
  fontSize: "14px",
  fontWeight: "500",
  color: "#111111",
}

const supStyle = {
  fontWeight: "300",
}

const informationTable = {
  borderCollapse: "collapse" as const,
  borderSpacing: "0px",
  color: "rgb(51,51,51)",
  backgroundColor: "rgb(250,250,250)",
  borderRadius: "3px",
  fontSize: "12px",
}

const informationTableRow = {
  height: "46px",
}

const informationTableColumn = {
  paddingLeft: "20px",
  borderStyle: "solid",
  borderColor: "white",
  borderWidth: "0px 1px 1px 0px",
  height: "44px",
}

const informationTableLabel = {
  ...resetText,
  color: "rgb(102,102,102)",
  fontSize: "10px",
}

const informationTableValue = {
  fontSize: "12px",
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
}

const productTitleTable = {
  ...informationTable,
  margin: "30px 0 15px 0",
  height: "24px",
}

const productsTitle = {
  background: "#fafafa",
  paddingLeft: "10px",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
}

const productIcon = {
  margin: "0 0 0 20px",
  borderRadius: "14px",
  border: "1px solid rgba(128,128,128,0.2)",
}

const productTitle = { fontSize: "12px", fontWeight: "600", ...resetText }

const productDescription = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  ...resetText,
}

const productLink = {
  fontSize: "12px",
  color: "rgb(0,112,201)",
  textDecoration: "none",
}

const divisor = {
  marginLeft: "4px",
  marginRight: "4px",
  color: "rgb(51,51,51)",
  fontWeight: 200,
}

const productPriceTotal = {
  margin: "0",
  color: "rgb(102,102,102)",
  fontSize: "10px",
  fontWeight: "600",
  padding: "0px 30px 0px 0px",
  textAlign: "right" as const,
}

const productPrice = {
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
}

const productPriceLarge = {
  margin: "0px 20px 0px 0px",
  fontSize: "16px",
  fontWeight: "600",
  whiteSpace: "nowrap" as const,
  textAlign: "right" as const,
}

const productPriceWrapper = {
  display: "table-cell",
  padding: "0px 20px 0px 0px",
  width: "100px",
  verticalAlign: "top",
}

const productPriceLine = { margin: "30px 0 0 0" }

const productPriceVerticalLine = {
  height: "48px",
  borderLeft: "1px solid",
  borderColor: "rgb(238,238,238)",
}

const productPriceLargeWrapper = { display: "table-cell", width: "90px" }

const productPriceLineBottom = { margin: "0 0 75px 0" }

const block = { display: "block" }

const ctaTitle = {
  display: "block",
  margin: "15px 0 0 0",
}

const ctaText = { fontSize: "24px", fontWeight: "500" }

const walletWrapper = { display: "table-cell", margin: "10px 0 0 0" }

const walletLink = { color: "rgb(0,126,255)", textDecoration: "none" }

const walletImage = {
  display: "inherit",
  paddingRight: "8px",
  verticalAlign: "middle",
}

const walletBottomLine = { margin: "65px 0 20px 0" }

const footerText = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  margin: "0",
  lineHeight: "auto",
  marginBottom: "16px",
}

const footerTextCenter = {
  fontSize: "12px",
  color: "rgb(102,102,102)",
  margin: "20px 0",
  lineHeight: "auto",
  textAlign: "center" as const,
}

const footerLink = { color: "rgb(0,115,255)" }

const footerIcon = { display: "block", margin: "40px 0 0 0" }

const footerLinksWrapper = {
  margin: "8px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
}

const footerCopyright = {
  margin: "25px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
}

const walletLinkText = {
  fontSize: "14px",
  fontWeight: "400",
  textDecoration: "none",
}
