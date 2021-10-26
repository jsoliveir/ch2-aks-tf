variable "cluster_name" {
  default = "aks01"
}

variable "location" {
  default = "westeurope"
}

variable "kubernetes_version" {
  type = string
  default = "1.22.2"
}

variable "environment" {
  validation {
    condition = can(regex("dev|prod",var.environment))
    error_message = "The environment must be dev or prd."
  }
}

variable "vm_size" {
  default = "Standard_DS2_v2"
}

variable "node_count" {
  type = number
  default = 2
}

variable "availability_zones" {
  type = list(number)
  default = [ 1,2 ]
}