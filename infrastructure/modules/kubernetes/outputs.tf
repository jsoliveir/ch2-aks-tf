output "resource_group" {
  value = azurerm_resource_group.aks.name
}

output "location" {
  value = azurerm_kubernetes_cluster.aks.location
}

output "ingress_ip" {
  value = azurerm_public_ip.nginx_ingress.ip_address
}

output "kube_config" {
  value = {
    host                   = "${azurerm_kubernetes_cluster.aks.kube_config.0.host}"
    client_certificate     = "${base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)}"
    cluster_ca_certificate = "${base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)}"
    client_key             = "${base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)}"
  }
}