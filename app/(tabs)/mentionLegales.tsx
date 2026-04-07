import React from 'react';
import {
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useBreakpoint } from '../../hooks/use-breakpoint';

const COLORS = {
	ink: '#1a1a2e',
	paper: '#f5f2eb',
	accent: '#2d6a4f',
	muted: '#6b7280',
	rule: '#d4c9b0',
	tagBg: '#e8f5e9',
	tagFg: '#2d6a4f',
	white: '#ffffff',
};

type InfoRow = {
	label: string;
	value: string | React.ReactNode;
};

function SectionHeader({ num, title }: { num: string; title: string }) {
	return (
		<View style={styles.sectionHeader}>
			<View style={styles.sectionNum}>
				<Text style={styles.sectionNumText}>{num}</Text>
			</View>
			<Text style={styles.h2}>{title}</Text>
		</View>
	);
}

function InfoCard({ rows }: { rows: InfoRow[] }) {
	return (
		<View style={styles.infoCard}>
			{rows.map((row) => (
				<View key={row.label} style={styles.infoRow}>
					<Text style={styles.infoLabel}>{row.label}</Text>
					{typeof row.value === 'string' ? (
						<Text style={styles.infoValue}>{row.value}</Text>
					) : (
						<View style={styles.infoValueWrap}>{row.value}</View>
					)}
				</View>
			))}
		</View>
	);
}

function Placeholder({ text }: { text: string }) {
	return <Text style={styles.placeholder}>{text}</Text>;
}

function TocItem({ num, label }: { num: string; label: string }) {
	return (
		<View style={styles.tocItem}>
			<Text style={styles.tocNum}>{num}.</Text>
			<Text style={styles.tocText}>{label}</Text>
		</View>
	);
}

export default function MentionLegalesScreen() {
	const { isMobile } = useBreakpoint();
	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={styles.header}>
				<View style={[styles.headerTag, { width: isMobile ? '80%' : '30%' }]}>
					<Text style={[styles.headerTagText, { fontSize: isMobile ? 12 : 16 }]}>Document juridique</Text>
				</View>
				<Text style={[styles.h1, { fontSize: isMobile ? 24 : 32 }]}>Mentions légales et RGPD</Text>
				<Text style={[styles.headerSub, { fontSize: isMobile ? 16 : 24 }]}>
					Application de Suivi Vétérinaire - ASV - Dernière mise à jour : avril 2026
				</Text>
			</View>

			<View style={styles.main}>
				<View style={styles.alert}>
					<Text style={styles.alertText}>
						Ce document est produit dans le cadre du <Text style={styles.bold}>projet
						final RNCP 37873</Text>. Les champs surlignés en jaune sont des{' '}
						<Text style={styles.bold}>placeholders à compléter</Text> avant toute mise en
						production réelle.
					</Text>
				</View>

				<View style={styles.toc}>
					<Text style={styles.tocTitle}>Sommaire</Text>
					<TocItem num="1" label="Editeur du site" />
					<TocItem num="2" label="Hebergeur" />
					<TocItem num="3" label="Propriété intellectuelle" />
					<TocItem num="4" label="Limitation de responsabilité" />
					<TocItem num="5" label="Protection des données personnelles (RGPD)" />
					<TocItem num="6" label="Vos droits" />
					<TocItem num="7" label="Cookies" />
					<TocItem num="8" label="Contact et réclamations" />
				</View>

				<View style={styles.section}>
					<SectionHeader num="1" title="Editeur du site" />
					<Text style={styles.p}>
						Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance
						dans l'économie numérique (LCEN), les informations relatives à l'éditeur de
						l'application ASV sont les suivantes :
					</Text>
					<InfoCard
						rows={[
							{ label: 'Dénomination', value: <Placeholder text="[Nom de la société]" /> },
							{ label: 'Forme juridique', value: <Placeholder text="[SAS / SARL / SA]" /> },
							{ label: 'Capital social', value: <Placeholder text="[Montant] EUR" /> },
							{ label: 'Siège social', value: <Placeholder text="[Adresse complète]" /> },
							{ label: 'SIRET', value: <Placeholder text="[000 000 000 00000]" /> },
							{ label: 'RCS', value: <Placeholder text="[Ville] - [Numéro RCS]" /> },
							{ label: 'Directeur de publication', value: <Placeholder text="[Prénom Nom]" /> },
							{ label: 'Email', value: <Placeholder text="[contact@domaine.fr]" /> },
							{ label: 'Téléphone', value: <Placeholder text="[+33 X XX XX XX XX]" /> },
						]}
					/>
				</View>

				<View style={styles.section}>
					<SectionHeader num="2" title="Hébergeur" />
					<Text style={styles.p}>
						L'application est actuellement hébergée dans un environnement de développement local
						(Docker). En cas de déploiement en production, les informations de l'hébergeur seront
						complétées conformément à l'article 6 de la LCEN.
					</Text>
					<InfoCard
						rows={[
							{ label: 'Ébergeur', value: <Placeholder text="[Nom de l'hébergeur]" /> },
							{ label: 'Adresse', value: <Placeholder text="[Adresse de l'hébergeur]" /> },
							{ label: 'Site web', value: <Placeholder text="[https://www.hebergeur.fr]" /> },
						]}
					/>
				</View>

				<View style={styles.section}>
					<SectionHeader num="3" title="Propriété intellectuelle" />
					<Text style={styles.p}>
						L'ensemble des éléments composant l'application ASV (structure, design, textes,
						logos, code source, base de données) est protégé par le droit de la propriété
						intellectuelle et demeure la propriété exclusive de l'éditeur ou de ses ayants droit.
					</Text>
					<Text style={styles.p}>
						Toute reproduction, représentation, modification, publication ou adaptation, totale
						ou partielle, de ces éléments sans l'autorisation préalable écrite de l'éditeur est
						strictement interdite et constituerait une contrefaçon sanctionnée par les articles
						L.335-2 et suivants du Code de la propriété intellectuelle.
					</Text>
					<Text style={styles.p}>
						Dans le cadre de ce projet pédagogique, les données vétérinaires présentées à titre
						de démonstration sont fictives et ne constituent pas des informations médicales
						réelles.
					</Text>
				</View>

				<View style={styles.section}>
					<SectionHeader num="4" title="Limitation de responsabilité" />
					<Text style={styles.p}>
						L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations
						diffusées sur l'application. Toutefois, l'éditeur ne peut garantir l'exactitude, la
						complétude ou l'actualité des informations, notamment à des fins médicales
						vétérinaires réelles.
					</Text>
					<Text style={styles.p}>
						<Text style={styles.bold}>
							L'application ASV est un outil de suivi informatif et ne se substitue en aucun cas
							à l'avis d'un vétérinaire diplômé.
						</Text>{' '}
						L'éditeur décline toute responsabilité en cas de décision médicale prise sur la seule
						base des informations fournies par l'application.
					</Text>
					<Text style={styles.p}>
						L'éditeur ne saurait être tenu responsable des dommages directs ou indirects causés à
						l'utilisateur lors de l'accès à l'application, notamment en cas d'interruption de
						service, d'intrusion extérieure ou de présence de virus informatiques.
					</Text>
				</View>

				<View style={styles.section}>
					<SectionHeader num="5" title="Protection des données personnelles" />
					<Text style={styles.p}>
						L'éditeur s'engage à ce que la collecte et le traitement de vos données personnelles
						soient effectués conformément au <Text style={styles.bold}>Règlement Général sur la
						Protection des Données (RGPD)</Text> - Règlement (UE) 2016/679 du 27 avril 2016 - et
						à la loi Informatique et Libertés n° 78-17 du 6 janvier 1978 modifiée.
					</Text>

					<Text style={styles.h3}>Responsable de traitement</Text>
					<InfoCard
						rows={[
							{
								label: 'Responsable',
								value: <Placeholder text="[Prenom Nom - Directeur / Gerant]" />,
							},
							{ label: 'Organisation', value: <Placeholder text="[Nom de la societe]" /> },
							{ label: 'Email DPO', value: <Placeholder text="[dpo@domaine.fr]" /> },
						]}
					/>

					<Text style={styles.h3}>Données collectées</Text>
					<Text style={styles.p}>
						Dans le cadre du fonctionnement de l'application ASV, les données suivantes peuvent
						être collectées :
					</Text>

					<ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableScroll}>
						<View>
							<View style={[styles.tableRow, styles.tableHead]}>
								<Text style={[styles.th, { width: 120 }]}>Catégorie</Text>
								<Text style={[styles.th, { width: 210 }]}>Données</Text>
								<Text style={[styles.th, { width: 180 }]}>Finalité</Text>
								<Text style={[styles.th, { width: 130 }]}>Base légale</Text>
								<Text style={[styles.th, { width: 130 }]}>Durée</Text>
							</View>
							{[
								['Compte utilisateur', 'Nom, prénom, email, mot de passe (hashé)', 'Authentification et accès à l\'application', 'Exécution du contrat', 'Durée du compte + 3 ans'],
								['Données vétérinaires', 'Informations sur les animaux, consultations, traitements', 'Suivi médical vétérinaire', 'Exécution du contrat', '5 ans après dernière consultation'],
								['Données de connexion', 'Adresse IP, horodatage, logs applicatifs', 'Sécurité et débogage', 'Intérêt légitime', '12 mois'],
								['Métriques d\'usage', 'Pages visitées, temps de session (anonymisé)', 'Amélioration du service', 'Intérêt légitime', '26 mois'],
							].map((row) => (
								<View key={row[0]} style={styles.tableRow}>
									<Text style={[styles.td, { width: 120 }]}>{row[0]}</Text>
									<Text style={[styles.td, { width: 210 }]}>{row[1]}</Text>
									<Text style={[styles.td, { width: 180 }]}>{row[2]}</Text>
									<Text style={[styles.td, { width: 130 }]}>{row[3]}</Text>
									<Text style={[styles.td, { width: 130 }]}>{row[4]}</Text>
								</View>
							))}
						</View>
					</ScrollView>

					<Text style={styles.h3}>Transfert de données</Text>
					<Text style={styles.p}>
						Les données personnelles sont traitées au sein de l'Union européenne. Aucun
						transfert vers des pays tiers n'est effectué sans garanties appropriées au sens du
						RGPD.
					</Text>

					<Text style={styles.h3}>Sous-traitants</Text>
					<Text style={styles.p}>
						L'éditeur peut faire appel à des sous-traitants techniques (hébergeur, service
						d'emails transactionnels). Chaque sous-traitant est lié par un contrat garantissant
						un niveau de protection équivalent au RGPD.
					</Text>
				</View>

				<View style={styles.section}>
					<SectionHeader num="6" title="Vos droits" />
					<Text style={styles.p}>
						Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants sur vos
						données personnelles :
					</Text>
					<View style={styles.rightsGrid}>
						{[
							{ icon: 'Acces', title: 'Droit d\'acces', desc: 'Obtenir une copie de vos données (art. 15)' },
							{ icon: 'Rectification', title: 'Droit de rectification', desc: 'Corriger des données inexactes (art. 16)' },
							{ icon: 'Effacement', title: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données (art. 17)' },
							{ icon: 'Limitation', title: 'Droit à la limitation', desc: 'Suspendre temporairement le traitement (art. 18)' },
							{ icon: 'Portabilite', title: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré (art. 20)' },
							{ icon: 'Opposition', title: 'Droit d\'opposition', desc: 'Vous opposer au traitement fondé sur l\'intérêt légitime (art. 21)' },
						].map((item) => (
							<View key={item.title} style={styles.rightItem}>
								<Text style={styles.rightItemTitle}>{item.title}</Text>
								<Text style={styles.rightItemDesc}>{item.desc}</Text>
							</View>
						))}
					</View>
					<Text style={[styles.p, { marginTop: 12 }]}>
						Pour exercer ces droits, adressez votre demande par email a :{' '}
						<Placeholder text="[dpo@domaine.fr]" /> en joignant une copie d'un justificatif
						d'identite. Un delai de reponse d'<Text style={styles.bold}>un mois</Text> maximum
						s'applique (art. 12 RGPD).
					</Text>
					<Text style={styles.p}>
						En cas de reponse insatisfaisante, vous pouvez introduire une reclamation aupres de
						la <Text style={styles.bold}>CNIL</Text> :{' '}
						<Text style={styles.link} onPress={() => Linking.openURL('https://www.cnil.fr')}>
							www.cnil.fr
						</Text>{' '}
						- 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
					</Text>
				</View>

				<View style={styles.section}>
					<SectionHeader num="7" title="Cookies" />
					<Text style={styles.p}>
						L'application ASV utilise des cookies et technologies similaires. Conformément à la
						recommandation CNIL du 17 septembre 2020, votre consentement est recueilli avant tout
						dépôt de cookie non strictement nécessaire.
					</Text>

					<ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableScroll}>
						<View>
							<View style={[styles.tableRow, styles.tableHead]}>
								<Text style={[styles.th, { width: 120 }]}>Cookie</Text>
								<Text style={[styles.th, { width: 110 }]}>Type</Text>
								<Text style={[styles.th, { width: 180 }]}>Finalité</Text>
								<Text style={[styles.th, { width: 100 }]}>Durée</Text>
								<Text style={[styles.th, { width: 140 }]}>Consentement requis</Text>
							</View>
							{[
								['PHPSESSID', 'Session', 'Gestion de session Symfony', 'Session', 'Non (essentiel)'],
								['jwt_token', 'Fonctionnel', 'Authentification API (JWT)', '1 heure', 'Non (essentiel)'],
								['refresh_token', 'Fonctionnel', 'Renouvellement du JWT', '30 jours', 'Non (essentiel)'],
								['[analytics_*]', 'Analytique', '[Mesure d\'audience]', '[13 mois]', 'Oui'],
							].map((row) => (
								<View key={row[0]} style={styles.tableRow}>
									<Text style={[styles.tdMono, { width: 120 }]}>{row[0]}</Text>
									<Text style={[styles.td, { width: 110 }]}>{row[1]}</Text>
									<Text style={[styles.td, { width: 180 }]}>{row[2]}</Text>
									<Text style={[styles.td, { width: 100 }]}>{row[3]}</Text>
									<Text style={[styles.td, { width: 140 }]}>{row[4]}</Text>
								</View>
							))}
						</View>
					</ScrollView>

					<Text style={styles.p}>
						Vous pouvez à tout moment modifier vos préférences cookies via le gestionnaire de
						consentement accessible en bas de l'application, ou en configurant votre navigateur.
					</Text>
				</View>

				<View style={styles.section}>
					<SectionHeader num="8" title="Contact et réclamations" />
					<Text style={styles.p}>
						Pour toute question relative au présent document ou à vos données personnelles :
					</Text>
					<InfoCard
						rows={[
							{ label: 'Email général', value: <Placeholder text="[contact@domaine.fr]" /> },
							{ label: 'Email RGPD / DPO', value: <Placeholder text="[dpo@domaine.fr]" /> },
							{
								label: 'Courrier postal',
								value: <Placeholder text="[Nom société - Adresse complète]" />,
							},
							{
								label: 'Autorité de contrôle',
								value: (
									<TouchableOpacity onPress={() => Linking.openURL('https://www.cnil.fr')}>
										<Text style={styles.link}>CNIL - www.cnil.fr</Text>
									</TouchableOpacity>
								),
							},
						]}
					/>
					<Text style={[styles.p, styles.muted, { marginTop: 12, fontSize: 13 }]}>
						Les présentes mentions légales peuvent être modifiées à tout moment. La version en
						vigueur est celle publiée sur l'application à la date de votre consultation.
					</Text>
				</View>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>
					ASV - Application de Suivi vétérinaire - Projet pédagogique CDA RNCP37873 - © 2026 Mélissa Bedhomme - Tous droits réservés - 
				</Text>
				
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.paper,
	},
	content: {
		paddingBottom: 32,
	},
	header: {
		backgroundColor: COLORS.ink,
		paddingTop: 48,
		paddingBottom: 40,
		paddingHorizontal: 24,
		alignItems: 'center',
	},
	headerTag: {
		backgroundColor: COLORS.accent,
		borderRadius: 2,
		paddingVertical: 4,
		paddingHorizontal: 12,
		marginBottom: 16,
	},
	headerTagText: {
		color: COLORS.white,
		fontSize: 11,
		letterSpacing: 2,
		textTransform: 'uppercase',
        textAlign: 'center',
	},
	h1: {
		color: '#f5f2eb',
		fontSize: 28,
		fontWeight: '600',
		textAlign: 'center',
	},
	headerSub: {
		marginTop: 8,
		fontSize: 12,
		color: 'rgba(245,242,235,0.5)',
		letterSpacing: 0.6,
		textAlign: 'center',
	},
	main: {
		maxWidth: 820,
		alignSelf: 'center',
		width: '100%',
		paddingHorizontal: 16,
		paddingTop: 24,
	},
	alert: {
		backgroundColor: '#fff8e1',
		borderLeftWidth: 3,
		borderLeftColor: '#f59e0b',
		borderRadius: 4,
		padding: 12,
		marginBottom: 20,
	},
	alertText: {
		fontSize: 13,
		color: '#78350f',
		lineHeight: 20,
	},
	toc: {
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.rule,
		borderLeftWidth: 4,
		borderLeftColor: COLORS.accent,
		borderRadius: 4,
		padding: 20,
		marginBottom: 32,
	},
	tocTitle: {
		fontWeight: '600',
		fontSize: 15,
		color: COLORS.accent,
		marginBottom: 12,
	},
	tocItem: {
		flexDirection: 'row',
		paddingVertical: 3,
		gap: 6,
	},
	tocNum: {
		fontSize: 13,
		color: COLORS.muted,
		width: 18,
	},
	tocText: {
		fontSize: 13,
		color: COLORS.ink,
		flex: 1,
	},
	section: {
		marginBottom: 40,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginBottom: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.rule,
	},
	sectionNum: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: COLORS.accent,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sectionNumText: {
		color: COLORS.white,
		fontSize: 12,
		fontWeight: '500',
	},
	h2: {
		fontSize: 20,
		fontWeight: '600',
		color: COLORS.ink,
		flex: 1,
	},
	h3: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.accent,
		marginTop: 20,
		marginBottom: 8,
	},
	p: {
		fontSize: 14,
		color: COLORS.ink,
		lineHeight: 22,
		marginBottom: 10,
	},
	bold: {
		fontWeight: '600',
	},
	muted: {
		color: COLORS.muted,
	},
	link: {
		color: COLORS.accent,
		textDecorationLine: 'underline',
	},
	infoCard: {
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.rule,
		borderRadius: 6,
		padding: 16,
		marginVertical: 10,
	},
	infoRow: {
		flexDirection: 'row',
		paddingVertical: 5,
		borderBottomWidth: 1,
		borderBottomColor: '#f0ebe0',
		flexWrap: 'wrap',
		gap: 4,
	},
	infoLabel: {
		fontSize: 12,
		color: COLORS.muted,
		fontWeight: '500',
		width: 160,
		lineHeight: 20,
	},
	infoValue: {
		fontSize: 12,
		color: COLORS.ink,
		flex: 1,
		lineHeight: 20,
	},
	infoValueWrap: {
		flex: 1,
	},
	placeholder: {
		backgroundColor: '#fff3cd',
		borderWidth: 1,
		borderColor: '#f0c030',
		borderRadius: 3,
		paddingHorizontal: 4,
		fontSize: 12,
		color: '#856404',
		fontStyle: 'italic',
	},
	rightsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginVertical: 10,
	},
	rightItem: {
		backgroundColor: COLORS.tagBg,
		borderRadius: 6,
		padding: 12,
		width: '48%',
	},
	rightItemTitle: {
		fontWeight: '500',
		color: COLORS.tagFg,
		fontSize: 12,
		marginBottom: 4,
	},
	rightItemDesc: {
		fontSize: 11,
		color: COLORS.ink,
		lineHeight: 16,
	},
	tableScroll: {
		marginVertical: 10,
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: COLORS.rule,
	},
	tableHead: {
		backgroundColor: COLORS.ink,
	},
	th: {
		color: '#f5f2eb',
		fontWeight: '500',
		fontSize: 12,
		padding: 8,
		lineHeight: 18,
	},
	td: {
		fontSize: 12,
		color: COLORS.ink,
		padding: 8,
		lineHeight: 18,
	},
	tdMono: {
		fontSize: 11,
		color: COLORS.ink,
		fontFamily: 'monospace',
		padding: 8,
		lineHeight: 18,
	},
	footer: {
		borderTopWidth: 1,
		borderTopColor: COLORS.rule,
		padding: 24,
		alignItems: 'center',
	},
	footerText: {
		fontSize: 11,
		color: COLORS.muted,
		textAlign: 'center',
		lineHeight: 18,
	},
});
