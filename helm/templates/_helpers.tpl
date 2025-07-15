{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "calendo.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "calendo.backend.name" -}}
{{- include "calendo.name" . }}-backend
{{- end }}

{{- define "calendo.frontend.name" -}}
{{- include "calendo.name" . }}-frontend
{{- end }}

{{- define "calendo.icalimporter.name" -}}
{{- include "calendo.name" . }}-icalimporter
{{- end }}

{{- define "calendo.imagegenerator.name" -}}
{{- include "calendo.name" . }}-imagegenerator
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "calendo.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "calendo.backend.fullname" -}}
{{- include "calendo.fullname" . }}-backend
{{- end }}

{{- define "calendo.frontend.fullname" -}}
{{- include "calendo.fullname" . }}-frontend
{{- end }}

{{- define "calendo.icalimporter.fullname" -}}
{{- include "calendo.fullname" . }}-icalimporter
{{- end }}

{{- define "calendo.imagegenerator.fullname" -}}
{{- include "calendo.fullname" . }}-imagegenerator
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "calendo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "calendo.backend.labels" -}}
helm.sh/chart: {{ include "calendo.chart" . }}
{{ include "calendo.backend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "calendo.frontend.labels" -}}
helm.sh/chart: {{ include "calendo.chart" . }}
{{ include "calendo.frontend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "calendo.icalimporter.labels" -}}
helm.sh/chart: {{ include "calendo.chart" . }}
{{ include "calendo.icalimporter.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "calendo.imagegenerator.labels" -}}
helm.sh/chart: {{ include "calendo.chart" . }}
{{ include "calendo.imagegenerator.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "calendo.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "calendo.backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "calendo.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "calendo.frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "calendo.icalimporter.selectorLabels" -}}
app.kubernetes.io/name: {{ include "calendo.icalimporter.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "calendo.imagegenerator.selectorLabels" -}}
app.kubernetes.io/name: {{ include "calendo.imagegenerator.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use for backend
*/}}
{{- define "calendo.backend.serviceAccountName" -}}
{{- if .Values.backend.serviceAccount.create }}
{{- default (include "calendo.backend.fullname" .) .Values.backend.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.backend.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use for frontend
*/}}
{{- define "calendo.frontend.serviceAccountName" -}}
{{- if .Values.frontend.serviceAccount.create }}
{{- default (include "calendo.frontend.fullname" .) .Values.frontend.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.frontend.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use for icalimporter
*/}}
{{- define "calendo.icalimporter.serviceAccountName" -}}
{{- if .Values.icalImporter.serviceAccount.create }}
{{- default (include "calendo.icalimporter.fullname" .) .Values.icalImporter.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.icalImporter.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use for imagegenerator
*/}}
{{- define "calendo.imagegenerator.serviceAccountName" -}}
{{- if .Values.imageGenerator.serviceAccount.create }}
{{- default (include "calendo.imagegenerator.fullname" .) .Values.imageGenerator.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.imageGenerator.serviceAccount.name }}
{{- end }}
{{- end }}
