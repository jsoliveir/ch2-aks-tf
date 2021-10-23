output "resource_group" {
  value = azurerm_resource_group.aks.name
}

output "location" {
  value = azurerm_kubernetes_cluster.aks.location
}

output "ingress_ip" {
  value = azurerm_public_ip.nginx_ingress.ip_address
}