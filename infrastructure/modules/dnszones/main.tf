terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 2.82.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "dns-zones-${var.environment}-rg"
  location = var.location
}

resource "azurerm_private_dns_zone" "dns" {
  count = var.private ? 1 : 0
  name                = "${var.environment}.${var.domain}"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_dns_zone" "dns" {
  count = var.private ? 0 : 1
  name                = "${var.environment}.${var.domain}"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_dns_a_record" "a" {
  for_each = { for record in (!var.private ? var.a_records: []) : record.name => record }
  resource_group_name = azurerm_resource_group.rg.name
  ttl = each.value.ttl == 0 ? 3600 :  each.value.ttl
  zone_name = azurerm_dns_zone.dns[0].name
  records = each.value.records
  name = each.key
  depends_on = [
    azurerm_dns_zone.dns[0]
  ]
}

resource "azurerm_private_dns_a_record" "a" {
  for_each = { for record in (var.private ? var.a_records: []) : record.name => record }
  resource_group_name = azurerm_resource_group.rg.name
  ttl = each.value.ttl == 0 ? 3600 :  each.value.ttl
  zone_name = azurerm_private_dns_zone.dns[0].name
  records = each.value.records
  name = each.key
  depends_on = [
    azurerm_private_dns_zone.dns[0]
  ]
  
}